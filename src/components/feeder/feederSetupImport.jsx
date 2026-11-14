import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Form from "../forms/form";
import { getLines } from "../../services/lineService";
import { getModels } from "../../services/modelService";
import {
  previewFeederSetup,
  importFeederSetup,
} from "../../services/feeder/feederSetupService";
import {
  BOARD_SIDE,
  sideKey,
  errorMessage,
} from "../../services/feeder/feederConstants";
import { parseSetupSheet } from "./parseSetupSheet";
import ModelPicker from "./modelPicker";

const ERROR_ISSUES = ["MissingValue", "UnknownCode", "AmbiguousCode", "DuplicateSlot", "InactiveSlot"];

// Excel import of a feeder setup: rows are parsed in the browser, validated by the
// backend (preview), and saved as a new draft version only when there are no errors.
class FeederSetupImport extends Form {
  fileRef = React.createRef();

  state = {
    lines: [],
    models: [],
    lineId: "",
    modelId: "",
    side: BOARD_SIDE.TOP,
    fileName: "",
    rows: [],
    headerDetected: true,
    preview: null,
    onlyIssues: false,
    fields: {},
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const [{ data: lines }, { data: models }] = await Promise.all([getLines(), getModels()]);
      this.setState({
        lines: lines.filter((l) => l.isActive !== false),
        models: models.filter((m) => m.isActive !== false),
      });
    } catch (ex) {
      toast.error(errorMessage(ex));
    } finally {
      this.setState({ loading: false });
    }
  }

  handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
      const { rows, headerDetected } = parseSetupSheet(sheetRows);

      this.setState({ fileName: file.name, rows, headerDetected }, this.refreshPreview);
    } catch (ex) {
      toast.error(this.props.t("feeder:import.unreadableFile"));
    }
  };

  setSelection = (changes) => {
    this.setState(changes, this.refreshPreview);
  };

  importPayload() {
    const { lineId, modelId, side, fileName, rows } = this.state;
    return {
      lineId: Number(lineId),
      modelId: Number(modelId),
      side: Number(side),
      sourceFileName: fileName,
      rows,
    };
  }

  refreshPreview = async () => {
    const { lineId, modelId, rows } = this.state;
    if (!lineId || !modelId || rows.length === 0) {
      this.setState({ preview: null });
      return;
    }

    this.setState({ loading: true });
    try {
      const { data: preview } = await previewFeederSetup(this.importPayload());
      this.setState({ preview });
    } catch (ex) {
      this.setState({ preview: null });
      toast.error(errorMessage(ex));
    } finally {
      this.setState({ loading: false });
    }
  };

  handleImport = async () => {
    const { t, navigate } = this.props;
    this.setState({ loading: true });
    try {
      const { data: setup } = await importFeederSetup(this.importPayload());
      toast.success(t("feeder:import.saved", { version: setup.version }));
      navigate(`/feeder-setup/${setup.id}`);
    } catch (ex) {
      toast.error(errorMessage(ex));
      this.setState({ loading: false });
    }
  };

  handleReset = () => {
    if (this.fileRef.current) this.fileRef.current.value = "";
    this.setState({ fileName: "", rows: [], preview: null, headerDetected: true });
  };

  renderSummary(preview) {
    const { t } = this.props;

    return (
      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
        <span className="badge bg-primary fs-6">
          {t("feeder:import.rowsCount", { count: preview.rows.length })}
        </span>
        <span className={`badge fs-6 ${preview.errorCount ? "bg-danger" : "bg-success"}`}>
          {t("feeder:import.errorCount", { count: preview.errorCount })}
        </span>
        <span className={`badge fs-6 ${preview.warningCount ? "bg-warning text-dark" : "bg-secondary"}`}>
          {t("feeder:import.warningCount", { count: preview.warningCount })}
        </span>
        <span className="text-muted">
          {t("feeder:import.nextVersion", { version: preview.nextVersion })}
          {preview.activeVersion
            ? " · " + t("feeder:import.activeVersion", { version: preview.activeVersion })
            : " · " + t("feeder:import.noActiveVersion")}
        </span>
        {preview.newSlotCount > 0 && (
          <span className="text-muted">
            · {t("feeder:import.newSlots", { count: preview.newSlotCount })}
            {preview.newModules.length > 0 &&
              " (" + t("feeder:import.newModules", { modules: preview.newModules.join(", ") }) + ")"}
          </span>
        )}
      </div>
    );
  }

  renderPreviewTable(preview) {
    const { t } = this.props;
    const rows = this.state.onlyIssues ? preview.rows.filter((r) => r.issues.length > 0) : preview.rows;

    return (
      <table className="table table-sm table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>{t("feeder:import.columns.row")}</th>
            <th>{t("feeder:common.module")}</th>
            <th>{t("feeder:common.feeder")}</th>
            <th>{t("feeder:import.columns.code")}</th>
            <th>{t("feeder:common.rcode")}</th>
            <th>{t("feeder:common.specification")}</th>
            <th>{t("feeder:common.slotCode")}</th>
            <th>{t("feeder:import.columns.issues")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rowNumber}
              className={row.hasError ? "table-danger" : row.issues.length ? "table-warning" : ""}
            >
              <td>{row.rowNumber}</td>
              <td>{row.module}</td>
              <td>{row.feeder}</td>
              <td className="text-break">{row.code}</td>
              <td>{row.rCode}</td>
              <td>{row.specification}</td>
              <td className="font-monospace small">{row.slotCode}</td>
              <td>
                {row.issues.map((issue) => (
                  <span
                    key={issue}
                    className={`badge me-1 ${ERROR_ISSUES.includes(issue) ? "bg-danger" : "bg-warning text-dark"}`}
                  >
                    {t(`feeder:issues.${issue}`)}
                  </span>
                ))}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan="8" className="text-muted">
                {t("feeder:import.noIssues")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    const { t } = this.props;
    const { lines, models, lineId, modelId, side, fileName, rows, headerDetected, preview, onlyIssues, loading } =
      this.state;

    return (
      <div className="row">
        {loading && <ReactLoading className="loading" type="spin" color="blue" />}

        <div className="col-12">
          <h5>{t("feeder:import.title")}</h5>
          <p className="text-muted small">{t("feeder:import.hint")}</p>
        </div>

        <div className="col-md-3">
          {this.renderSelect(
            "Line",
            lines,
            "",
            ({ target }) => this.setSelection({ lineId: target.value }),
            "id",
            "name",
            t("feeder:common.line"),
            lineId
          )}
        </div>
        <div className="col-md-4">
          <ModelPicker
            models={models}
            modelId={modelId}
            label={t("feeder:common.model")}
            placeholder={t("feeder:import.modelPlaceholder")}
            onChange={(id) => this.setSelection({ modelId: id })}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label" htmlFor="side">
            {t("feeder:common.side")}
          </label>
          <select
            id="side"
            className="form-select form-select-lg"
            value={side}
            onChange={(e) => this.setSelection({ side: Number(e.target.value) })}
          >
            {Object.values(BOARD_SIDE).map((s) => (
              <option key={s} value={s}>
                {t(`feeder:side.${sideKey(s)}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="setupFile">
            {t("feeder:import.file")}
          </label>
          <input
            id="setupFile"
            ref={this.fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="form-control form-control-lg"
            onChange={this.handleFile}
          />
        </div>

        {fileName && (
          <div className="col-12 mt-3">
            {!headerDetected && (
              <div className="alert alert-warning py-2">{t("feeder:import.headerNotDetected")}</div>
            )}
            {rows.length === 0 && <div className="alert alert-warning py-2">{t("feeder:import.emptyFile")}</div>}
            {rows.length > 0 && (!lineId || !modelId) && (
              <div className="alert alert-info py-2">{t("feeder:import.selectLineAndModel")}</div>
            )}
          </div>
        )}

        {preview && (
          <div className="col-12 mt-2">
            {preview.globalErrors.map((code) => (
              <div key={code} className="alert alert-danger py-2">
                {t(`feeder:issues.${code}`)}
              </div>
            ))}

            {this.renderSummary(preview)}

            <div className="d-flex gap-2 align-items-center mb-2">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={!preview.canImport || loading}
                onClick={this.handleImport}
              >
                {t("feeder:import.saveDraft", { version: preview.nextVersion })}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={this.refreshPreview}>
                {t("feeder:import.recheck")}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={this.handleReset}>
                {t("feeder:import.reset")}
              </button>
              <label className="form-check-label ms-auto">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
                  checked={onlyIssues}
                  onChange={() => this.setState({ onlyIssues: !onlyIssues })}
                />
                {t("feeder:import.onlyIssues")}
              </label>
            </div>

            {!preview.canImport && preview.errorCount > 0 && (
              <div className="alert alert-danger py-2">{t("feeder:import.fixErrors")}</div>
            )}

            {this.renderPreviewTable(preview)}
          </div>
        )}
      </div>
    );
  }
}

const TranslatedFeederSetupImport = withTranslation(["feeder", "common"])(FeederSetupImport);

const FeederSetupImportPage = () => <TranslatedFeederSetupImport navigate={useNavigate()} />;

export default FeederSetupImportPage;
