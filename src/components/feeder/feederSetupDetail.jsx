import React from "react";
import ReactLoading from "react-loading";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Form from "../forms/form";
import { getLines } from "../../services/lineService";
import {
  getFeederSetup,
  getFeederSetupDiff,
  activateFeederSetup,
  copyFeederSetup,
  deleteFeederSetup,
} from "../../services/feeder/feederSetupService";
import {
  SETUP_STATUS,
  DIFF_CHANGE,
  statusKey,
  statusBadge,
  sideKey,
  errorMessage,
  formatDate,
} from "../../services/feeder/feederConstants";

const DIFF_KEYS = {
  [DIFF_CHANGE.UNCHANGED]: "unchanged",
  [DIFF_CHANGE.ADDED]: "added",
  [DIFF_CHANGE.REMOVED]: "removed",
  [DIFF_CHANGE.CHANGED]: "changed",
};

const DIFF_ROW_CLASS = {
  [DIFF_CHANGE.ADDED]: "table-success",
  [DIFF_CHANGE.REMOVED]: "table-danger",
  [DIFF_CHANGE.CHANGED]: "table-warning",
};

const DIFF_BADGE_CLASS = {
  [DIFF_CHANGE.ADDED]: "bg-success",
  [DIFF_CHANGE.CHANGED]: "bg-warning text-dark",
  [DIFF_CHANGE.REMOVED]: "bg-danger",
  [DIFF_CHANGE.UNCHANGED]: "bg-secondary",
};

class FeederSetupDetail extends Form {
  state = {
    setup: null,
    diff: null,
    lines: [],
    tab: "items",
    hideUnchanged: true,
    copyLineId: "",
    fields: {},
    errors: {},
    loading: true,
    confirm: { show: false, payload: null, onConfirm: null },
  };

  async componentDidMount() {
    try {
      const { data: lines } = await getLines();
      this.setState({ lines: lines.filter((l) => l.isActive !== false) });
    } catch (ex) {
      toast.error(errorMessage(ex));
    }
    await this.load();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) await this.load();
  }

  async load() {
    const { id } = this.props.params;
    this.setState({ loading: true });
    try {
      const [{ data: setup }, { data: diff }] = await Promise.all([
        getFeederSetup(id),
        getFeederSetupDiff(id),
      ]);
      // A new draft is most useful seen as "what changes" - open that tab first.
      const tab = setup && setup.status === SETUP_STATUS.DRAFT && diff && diff.againstSetupId ? "diff" : "items";
      this.setState({ setup: setup || null, diff, tab });
    } catch (ex) {
      toast.error(errorMessage(ex));
    } finally {
      this.setState({ loading: false });
    }
  }

  async run(request, successKey, afterSuccess) {
    const { t } = this.props;
    this.setState({ loading: true });
    try {
      const { data } = await request();
      toast.success(t(successKey, { version: data && data.version }));
      if (afterSuccess) afterSuccess(data);
      else await this.load();
    } catch (ex) {
      toast.error(errorMessage(ex));
      this.setState({ loading: false });
    }
  }

  handleActivate = () => {
    this.setState({ confirmAction: "activate" });
    this.requestConfirm(null, () =>
      this.run(() => activateFeederSetup(this.state.setup.id), "feeder:detail.activated")
    );
  };

  handleDelete = () => {
    this.setState({ confirmAction: "delete" });
    this.requestConfirm(null, () =>
      this.run(() => deleteFeederSetup(this.state.setup.id), "feeder:detail.deleted", () =>
        this.props.navigate("/feeder-setup")
      )
    );
  };

  handleCopy = () => {
    const { setup, copyLineId } = this.state;
    this.run(() => copyFeederSetup(setup.id, Number(copyLineId)), "feeder:detail.copied", (copy) =>
      this.props.navigate(`/feeder-setup/${copy.id}`)
    );
  };

  renderHeader(setup) {
    const { t } = this.props;
    const { lines, copyLineId } = this.state;
    const otherLines = lines.filter((l) => l.id !== setup.lineId);

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h5 className="mb-0">
              {setup.modelName} · {setup.lineName} · {t(`feeder:side.${sideKey(setup.side)}`)} · v{setup.version}
            </h5>
            <span className={`badge fs-6 ${statusBadge(setup.status)}`}>
              {t(`feeder:status.${statusKey(setup.status)}`)}
            </span>
          </div>
          <div className="small text-muted mb-3">
            {t("feeder:detail.createdBy", { user: setup.createdBy || "-", date: formatDate(setup.createdAt) })}
            {setup.sourceFileName && ` · ${setup.sourceFileName}`}
            {setup.activatedAt &&
              " · " + t("feeder:detail.activatedBy", { user: setup.activatedBy || "-", date: formatDate(setup.activatedAt) })}
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            {setup.status !== SETUP_STATUS.ACTIVE && (
              <button type="button" className="btn btn-success" onClick={this.handleActivate}>
                {setup.status === SETUP_STATUS.ARCHIVED ? t("feeder:detail.rollback") : t("feeder:detail.activate")}
              </button>
            )}
            {setup.status === SETUP_STATUS.DRAFT && (
              <button type="button" className="btn btn-outline-danger" onClick={this.handleDelete}>
                {t("feeder:detail.deleteDraft")}
              </button>
            )}

            <div className="d-flex gap-2 align-items-center ms-auto">
              <select
                className="form-select"
                style={{ width: 180 }}
                value={copyLineId}
                onChange={(e) => this.setState({ copyLineId: e.target.value })}
                aria-label={t("feeder:detail.copyTo")}
              >
                <option value="">{t("feeder:detail.copyTo")}</option>
                {otherLines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-outline-primary" disabled={!copyLineId} onClick={this.handleCopy}>
                {t("feeder:detail.copy")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderItems(setup) {
    const { t } = this.props;

    return (
      <table className="table table-sm table-striped align-middle">
        <thead>
          <tr>
            <th>{t("feeder:common.module")}</th>
            <th>{t("feeder:common.feeder")}</th>
            <th>{t("feeder:common.rcode")}</th>
            <th>{t("feeder:common.specification")}</th>
            <th>{t("feeder:detail.partNumbers")}</th>
            <th>{t("feeder:detail.importedCode")}</th>
            <th>{t("feeder:common.slotCode")}</th>
          </tr>
        </thead>
        <tbody>
          {setup.items.map((item) => (
            <tr key={item.id}>
              <td className="fw-bold">{item.moduleName}</td>
              <td className="fw-bold">{item.slotNumber}</td>
              <td>{item.rCode}</td>
              <td>{item.specification}</td>
              <td className="small">{(item.partNumbers || []).join(", ")}</td>
              <td className="small text-break">{item.importedCode}</td>
              <td className="font-monospace small">{item.slotCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  renderDiff(diff) {
    const { t } = this.props;
    const { hideUnchanged } = this.state;
    const rows = hideUnchanged ? diff.rows.filter((r) => r.change !== DIFF_CHANGE.UNCHANGED) : diff.rows;
    const counts = diff.rows.reduce((acc, r) => ({ ...acc, [r.change]: (acc[r.change] || 0) + 1 }), {});

    return (
      <>
        <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
          <span className="text-muted">
            {diff.againstVersion
              ? t("feeder:diff.against", { version: diff.againstVersion })
              : t("feeder:diff.firstVersion")}
          </span>
          {[DIFF_CHANGE.ADDED, DIFF_CHANGE.CHANGED, DIFF_CHANGE.REMOVED, DIFF_CHANGE.UNCHANGED].map((c) => (
            <span key={c} className={`badge ${DIFF_BADGE_CLASS[c]}`}>
              {t(`feeder:diff.${DIFF_KEYS[c]}`)}: {counts[c] || 0}
            </span>
          ))}
          <label className="form-check-label ms-auto">
            <input
              type="checkbox"
              className="form-check-input me-1"
              checked={hideUnchanged}
              onChange={() => this.setState({ hideUnchanged: !hideUnchanged })}
            />
            {t("feeder:diff.hideUnchanged")}
          </label>
        </div>

        <table className="table table-sm table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>{t("feeder:common.module")}</th>
              <th>{t("feeder:common.feeder")}</th>
              <th>{t("feeder:diff.change")}</th>
              <th>{t("feeder:diff.before")}</th>
              <th>{t("feeder:diff.after")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.feederSlotId} className={DIFF_ROW_CLASS[r.change] || ""}>
                <td className="fw-bold">{r.moduleName}</td>
                <td className="fw-bold">{r.slotNumber}</td>
                <td>{t(`feeder:diff.${DIFF_KEYS[r.change]}`)}</td>
                <td>{r.oldRCode && `${r.oldRCode} - ${r.oldSpecification || ""}`}</td>
                <td>{r.newRCode && `${r.newRCode} - ${r.newSpecification || ""}`}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="text-muted">
                  {t("feeder:diff.noChanges")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    );
  }

  render() {
    const { t } = this.props;
    const { setup, diff, tab, loading, confirmAction } = this.state;

    return (
      <div className="row">
        {loading && <ReactLoading className="loading" type="spin" color="blue" />}
        {this.renderConfirmModal(
          confirmAction === "activate"
            ? {
                title: t("feeder:detail.activateTitle"),
                message: t("feeder:detail.activateMessage"),
                confirmLabel: t("feeder:detail.activate"),
              }
            : {
                title: t("feeder:detail.deleteTitle"),
                message: t("feeder:detail.deleteMessage"),
                confirmLabel: t("feeder:detail.deleteDraft"),
              }
        )}

        <div className="col-12 mb-2">
          <Link to="/feeder-setup">← {t("feeder:setups.title")}</Link>
        </div>

        {!loading && !setup && (
          <div className="col-12">
            <div className="alert alert-warning">{t("feeder:detail.notFound")}</div>
          </div>
        )}

        {setup && (
          <div className="col-12">
            {this.renderHeader(setup)}

            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${tab === "items" ? "active" : ""}`}
                  onClick={() => this.setState({ tab: "items" })}
                >
                  {t("feeder:detail.itemsTab", { count: setup.items.length })}
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${tab === "diff" ? "active" : ""}`}
                  onClick={() => this.setState({ tab: "diff" })}
                >
                  {t("feeder:detail.diffTab")}
                </button>
              </li>
            </ul>

            {tab === "items" && this.renderItems(setup)}
            {tab === "diff" && diff && this.renderDiff(diff)}
          </div>
        )}
      </div>
    );
  }
}

const TranslatedFeederSetupDetail = withTranslation(["feeder", "common"])(FeederSetupDetail);

const FeederSetupDetailPage = (props) => (
  <TranslatedFeederSetupDetail {...props} params={useParams()} navigate={useNavigate()} />
);

export default FeederSetupDetailPage;
