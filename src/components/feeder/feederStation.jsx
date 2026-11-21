import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { withTranslation } from "react-i18next";
import {
  getFeederStation,
  lookupReel,
  verifyReel,
} from "../../services/feeder/feederStationService";
import {
  SCAN_RESULT,
  NG_REASON,
  sideKey,
  isSlotCode,
  slotLabel,
  errorMessage,
} from "../../services/feeder/feederConstants";
import { playOk, playNg, playBeep } from "../../utils/chime";

// Operator station (bare kiosk route): scan the reel -> the screen shows MODUL / FIDER in huge
// text -> put the reel there and scan that slot's sticker -> full-screen OK or NG.
// A keyboard-wedge scanner types into the always-focused input and ends with Enter.

const PANEL = {
  idle: { bg: "#1f2937", fg: "#fff" },
  target: { bg: "#1d4ed8", fg: "#fff" },
  alternate: { bg: "#ca8a04", fg: "#fff" },
  ok: { bg: "#15803d", fg: "#fff" },
  ng: { bg: "#b91c1c", fg: "#fff" },
  warn: { bg: "#c2410c", fg: "#fff" },
};

// Main MODUL / FIDER / OK / NG text: as large as the screen height allows.
const HUGE = "clamp(6rem, 30vh, 22rem)";

// After a wrong sticker the reel stays pending: the operator moves it and rescans the sticker only.
const RETRY_SLOT_REASONS = ["WrongSlot", "UnknownSlot", "WrongLine"];

const storageKey = (lineId) => `feederStation.setup.${lineId}`;

function readStoredSetup(lineId) {
  try {
    return localStorage.getItem(storageKey(lineId));
  } catch (ex) {
    return null;
  }
}

function storeSetup(lineId, setupId) {
  try {
    localStorage.setItem(storageKey(lineId), String(setupId));
  } catch (ex) {}
}

class FeederStation extends Component {
  inputRef = React.createRef();

  state = {
    station: null,
    setupId: "",
    scanText: "",
    // pending: { reelCode, lookup } while waiting for the slot sticker
    pending: null,
    // panel: { kind, ... } what the big panel shows
    panel: { kind: "idle" },
    counts: { ok: 0, ng: 0 },
    busy: false,
    error: null,
  };

  async componentDidMount() {
    await this.loadStation();
    this.focusTimer = setInterval(this.keepFocus, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.focusTimer);
  }

  get lineId() {
    return Number(this.props.params.lineId);
  }

  // The scanner only works when the input has focus; take it back unless the operator
  // is using the setup selector.
  keepFocus = () => {
    const active = document.activeElement;
    if (this.inputRef.current && (!active || active === document.body || active === this.inputRef.current))
      this.inputRef.current.focus();
  };

  async loadStation(keepSelection = true) {
    try {
      const { data: station } = await getFeederStation(this.lineId);
      const setupId = this.pickSetup(station, keepSelection ? this.state.setupId : "");
      this.setState({ station, setupId, error: null });
    } catch (ex) {
      this.setState({ error: errorMessage(ex) });
    }
    this.keepFocus();
  }

  // Keep the current choice if still active, else the last one used on this line,
  // else the line's active model, else the only setup there is.
  pickSetup(station, current) {
    const ids = station.setups.map((s) => String(s.setupId));
    const stored = readStoredSetup(this.lineId);
    const forActiveModel = station.setups.find((s) => s.modelId === station.activeModelId);

    if (current && ids.includes(String(current))) return String(current);
    if (stored && ids.includes(stored)) return stored;
    if (forActiveModel) return String(forActiveModel.setupId);
    if (station.setups.length === 1) return String(station.setups[0].setupId);
    return "";
  }

  handleSetupChange = (e) => {
    const setupId = e.target.value;
    storeSetup(this.lineId, setupId);
    this.setState({ setupId, pending: null, panel: { kind: "idle" } }, () => this.inputRef.current.focus());
  };

  handleKeyDown = async (e) => {
    if (e.key === "Escape") {
      this.setState({ pending: null, panel: { kind: "idle" }, scanText: "" });
      return;
    }
    if (e.key !== "Enter") return;

    const code = this.state.scanText.trim();
    this.setState({ scanText: "" });
    if (!code || this.state.busy) return;

    if (!this.state.setupId) {
      playBeep();
      this.setState({ panel: { kind: "warn", messageKey: "feeder:station.selectSetupFirst" } });
      return;
    }

    if (isSlotCode(code)) await this.handleSlotScan(code);
    else await this.handleReelScan(code);
  };

  get requireSlotScan() {
    return !!(this.state.station && this.state.station.requireSlotScan);
  }

  async handleReelScan(reelCode) {
    const { setupId } = this.state;
    this.setState({ busy: true });
    try {
      const { data: lookup } = await lookupReel({ lineId: this.lineId, setupId: Number(setupId), reelCode });

      const kind = lookup.isAlternate ? "alternate" : "target";

      if (lookup.result === SCAN_RESULT.NG) {
        playNg();
        this.countResult(lookup.result);
        this.setState({ pending: null, panel: { kind: "ng", response: lookup } });
        await this.afterNg(lookup);
      } else if (this.requireSlotScan) {
        playBeep();
        this.setState({ pending: { reelCode, lookup }, panel: { kind, response: lookup } });
      } else {
        // No sticker step on this line: showing where the reel goes is the whole scan
        // (the backend has already logged it), ready for the next reel.
        playOk();
        this.countResult(lookup.result);
        this.setState({ pending: null, panel: { kind, response: lookup, placed: true } });
      }
    } catch (ex) {
      this.showError(ex);
    } finally {
      this.setState({ busy: false });
    }
  }

  async handleSlotScan(slotCode) {
    const { pending, setupId } = this.state;
    if (!this.requireSlotScan) {
      playBeep();
      this.setState({ panel: { kind: "warn", messageKey: "feeder:station.slotScanOff" } });
      return;
    }
    if (!pending) {
      playBeep();
      this.setState({ panel: { kind: "warn", messageKey: "feeder:station.scanReelFirst" } });
      return;
    }

    this.setState({ busy: true });
    try {
      const { data: result } = await verifyReel({
        lineId: this.lineId,
        setupId: Number(setupId),
        reelCode: pending.reelCode,
        slotCode,
      });

      this.countResult(result.result);

      if (result.result === SCAN_RESULT.NG) {
        playNg();
        const retry = RETRY_SLOT_REASONS.includes(NG_REASON[result.ngReason]);
        this.setState({ pending: retry ? pending : null, panel: { kind: "ng", response: result, retry } });
        await this.afterNg(result);
      } else {
        playOk();
        this.setState({ pending: null, panel: { kind: "ok", response: result } });
      }
    } catch (ex) {
      this.showError(ex);
    } finally {
      this.setState({ busy: false });
    }
  }

  // The selected setup was replaced (newer version activated) - reload the list so the
  // operator can pick the new one.
  async afterNg(response) {
    if (NG_REASON[response.ngReason] === "NoActiveSetup") await this.loadStation(false);
  }

  countResult(result) {
    const counts = { ...this.state.counts };
    if (result === SCAN_RESULT.NG) counts.ng++;
    else counts.ok++;
    this.setState({ counts });
  }

  showError(ex) {
    playNg();
    this.setState({ panel: { kind: "warn", text: errorMessage(ex) } });
  }

  renderPanel() {
    const { t } = this.props;
    const { panel } = this.state;
    const colors = PANEL[panel.kind];
    const r = panel.response;

    let content;
    switch (panel.kind) {
      case "target":
      case "alternate":
        content = (
          <>
            {this.renderTargets(r.targets)}
            <div className="fs-2 mt-2">
              {r.rCode} · {r.specification}
            </div>
            {panel.kind === "alternate" && (
              <div className="fs-2 fw-bold">⚠ {t("feeder:station.alternate", { partNumber: r.reelPartNumber })}</div>
            )}
          </>
        );
        break;

      case "ok":
        content = (
          <>
            <div style={{ fontSize: HUGE, fontWeight: 800, lineHeight: 1 }}>OK</div>
            <div style={{ fontSize: "clamp(2.5rem, 8vh, 6rem)", fontWeight: 700 }}>{slotLabel(r.scannedSlot)}</div>
            {r.isAlternate && (
              <div className="fs-2">⚠ {t("feeder:station.alternate", { partNumber: r.reelPartNumber })}</div>
            )}
          </>
        );
        break;

      case "ng": {
        const reason = NG_REASON[r.ngReason];
        const showTargets = r.targets && r.targets.length > 0;
        content = (
          <>
            <div style={{ fontSize: showTargets ? "clamp(4rem, 14vh, 10rem)" : HUGE, fontWeight: 800, lineHeight: 1 }}>
              NG
            </div>
            <div style={{ fontSize: "clamp(2rem, 6vh, 4.5rem)", fontWeight: 700 }}>{t(`feeder:ngReasons.${reason}`)}</div>
            {reason === "WrongSlot" && (
              <div className="fs-2">
                {t("feeder:station.scannedSlot", { slot: slotLabel(r.scannedSlot) })}
                {r.scannedSlotExpectedRCode &&
                  " - " + t("feeder:station.slotIsFor", { rCode: r.scannedSlotExpectedRCode })}
              </div>
            )}
            {showTargets && <div className="mt-2">{this.renderTargets(r.targets, true)}</div>}
          </>
        );
        break;
      }

      case "warn":
        content = <div style={{ fontSize: "clamp(2rem, 7vh, 5rem)", fontWeight: 700 }}>{panel.text || t(panel.messageKey)}</div>;
        break;

      default:
        content = (
          <div style={{ fontSize: "clamp(3rem, 12vh, 8rem)", fontWeight: 700 }}>{t("feeder:station.scanReel")}</div>
        );
    }

    return (
      <div
        className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center rounded-3 p-3"
        style={{ background: colors.bg, color: colors.fg }}
        role="status"
        aria-live="assertive"
      >
        {content}
      </div>
    );
  }

  // MODUL / FIDER as large as the screen allows; smaller when the component sits in several
  // feeders or under an NG headline.
  renderTargets(targets, compact = false) {
    const { t } = this.props;
    const size = compact || targets.length > 1 ? "clamp(4rem, 15vh, 11rem)" : HUGE;

    return targets.map((target) => (
      <div key={target.feederSlotId} className="d-flex justify-content-center" style={{ gap: "6vw", lineHeight: 1 }}>
        <div>
          <div className="fs-2 text-uppercase">{t("feeder:station.module")}</div>
          <div style={{ fontSize: size, fontWeight: 800 }}>{target.moduleName}</div>
        </div>
        <div>
          <div className="fs-2 text-uppercase">{t("feeder:station.feeder")}</div>
          <div style={{ fontSize: size, fontWeight: 800 }}>{target.slotNumber}</div>
        </div>
      </div>
    ));
  }

  render() {
    const { t } = this.props;
    const { station, setupId, scanText, pending, counts, error } = this.state;

    return (
      <div
        className="vh-100 p-2 d-flex flex-column gap-2"
        style={{ background: "#111827", color: "#f9fafb" }}
        onClick={() => setTimeout(this.keepFocus, 0)}
      >
        <div className="d-flex align-items-center gap-2">
          <div className="fs-3 fw-bold text-nowrap">{station ? station.lineName : "..."}</div>

          {station && (
            <select
              className="form-select form-select-lg"
              style={{ maxWidth: 340 }}
              value={setupId}
              onChange={this.handleSetupChange}
              aria-label={t("feeder:station.setup")}
            >
              <option value="">{t("feeder:station.selectSetup")}</option>
              {station.setups.map((s) => (
                <option key={s.setupId} value={s.setupId}>
                  {s.modelName} · {t(`feeder:side.${sideKey(s.side)}`)} · v{s.version}
                </option>
              ))}
            </select>
          )}

          <input
            ref={this.inputRef}
            className="form-control form-control-lg flex-grow-1"
            value={scanText}
            autoFocus
            autoComplete="off"
            placeholder={pending ? t("feeder:station.scanSlotPlaceholder") : t("feeder:station.scanReelPlaceholder")}
            onChange={(e) => this.setState({ scanText: e.target.value })}
            onKeyDown={this.handleKeyDown}
            aria-label={t("feeder:station.scanInput")}
          />
          {pending && (
            <button
              type="button"
              className="btn btn-outline-light btn-lg text-nowrap"
              onClick={() => this.setState({ pending: null, panel: { kind: "idle" } })}
            >
              {t("feeder:station.cancel")}
            </button>
          )}

          <span className="badge bg-success fs-5">OK: {counts.ok}</span>
          <span className="badge bg-danger fs-5">NG: {counts.ng}</span>
        </div>

        {error && <div className="alert alert-danger mb-0 py-2">{error}</div>}
        {station && station.setups.length === 0 && (
          <div className="alert alert-warning mb-0 py-2">{t("feeder:station.noSetups")}</div>
        )}

        {this.renderPanel()}
      </div>
    );
  }
}

const TranslatedFeederStation = withTranslation(["feeder", "common"])(FeederStation);

const FeederStationPage = (props) => <TranslatedFeederStation {...props} params={useParams()} />;

export default FeederStationPage;
