import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { getLineMachine } from "../../services/feeder/lineMachineService";
import { errorMessage } from "../../services/feeder/feederConstants";

// Printable sheet of slot stickers (bare route, no navbar). Each sticker carries the
// slot code as a QR - operators scan it after the reel to prove where the reel went.
const PRINT_CSS = `
  .slot-labels { display: flex; flex-wrap: wrap; gap: 2mm; }
  .slot-label {
    width: 50mm; height: 25mm; box-sizing: border-box;
    border: 1px dashed #999; padding: 1.5mm;
    display: flex; align-items: center; gap: 2mm;
    break-inside: avoid; page-break-inside: avoid;
    background: #fff; color: #000;
  }
  .slot-label-text { line-height: 1.1; overflow: hidden; }
  .slot-label-position { font-size: 7mm; font-weight: 700; white-space: nowrap; }
  .slot-label-line { font-size: 2.6mm; }
  .slot-label-code { font-size: 2.4mm; font-family: monospace; }
  @media print {
    .no-print { display: none !important; }
    body { margin: 0; }
    .slot-label { border-color: #ccc; }
  }
`;

class SlotLabelPrint extends Component {
  state = {
    machine: null,
    selectedModules: {},
    onlyActive: true,
    error: null,
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data } = await getLineMachine(this.props.params.lineId);
      const selectedModules = {};
      ((data && data.modules) || []).forEach((m) => (selectedModules[m.id] = true));
      this.setState({ machine: data || null, selectedModules });
    } catch (ex) {
      this.setState({ error: errorMessage(ex, this.props.t) });
    } finally {
      this.setState({ loading: false });
    }
  }

  toggleModule(id) {
    const { selectedModules } = this.state;
    this.setState({ selectedModules: { ...selectedModules, [id]: !selectedModules[id] } });
  }

  labels() {
    const { machine, selectedModules, onlyActive } = this.state;
    if (!machine) return [];

    return machine.modules
      .filter((m) => selectedModules[m.id])
      .flatMap((m) =>
        m.slots
          .filter((s) => !onlyActive || s.isActive)
          .map((s) => ({ ...s, moduleName: m.name }))
      );
  }

  render() {
    const { t } = this.props;
    const { machine, selectedModules, onlyActive, error, loading } = this.state;
    const labels = this.labels();

    return (
      <div className="p-3">
        <style>{PRINT_CSS}</style>

        <div className="no-print mb-3">
          <h5>
            {t("feeder:labels.title")}
            {machine && ` - ${machine.lineName} (${machine.name})`}
          </h5>
          {loading && <p>{t("feeder:common.loading")}</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && !machine && (
            <div className="alert alert-info">{t("feeder:machine.noMachine")}</div>
          )}

          {machine && (
            <div className="d-flex flex-wrap gap-3 align-items-center">
              {machine.modules.map((m) => (
                <label key={m.id} className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input me-1"
                    checked={!!selectedModules[m.id]}
                    onChange={() => this.toggleModule(m.id)}
                  />
                  {m.name}
                </label>
              ))}
              <label className="form-check-label ms-3">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
                  checked={onlyActive}
                  onChange={() => this.setState({ onlyActive: !onlyActive })}
                />
                {t("feeder:labels.onlyActive")}
              </label>
              <span className="text-muted">{t("feeder:labels.count", { count: labels.length })}</span>
              <button
                type="button"
                className="btn btn-success"
                disabled={labels.length === 0}
                onClick={() => window.print()}
              >
                {t("feeder:labels.print")}
              </button>
            </div>
          )}
        </div>

        <div className="slot-labels">
          {labels.map((slot) => (
            <div key={slot.id} className="slot-label">
              <QRCodeSVG value={slot.slotCode} size={76} level="M" includeMargin={false} />
              <div className="slot-label-text">
                <div className="slot-label-position">
                  {slot.moduleName} · {slot.number}
                </div>
                <div className="slot-label-line">{machine.lineName}</div>
                <div className="slot-label-code">{slot.slotCode}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const TranslatedSlotLabelPrint = withTranslation(["feeder", "common"])(SlotLabelPrint);

const SlotLabelPrintPage = (props) => <TranslatedSlotLabelPrint {...props} params={useParams()} />;

export default SlotLabelPrintPage;
