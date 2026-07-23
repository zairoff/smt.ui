import React from "react";
import ReactLoading from "react-loading";
import Form from "../../forms/form";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  scanBoard,
  getRecentMovements,
} from "../../../services/board-flow/boardV2Service";
import { getQrReadersV2 } from "../../../services/board-flow/qrReaderV2Service";
import { buildStages } from "../../../utils/boardFlowStages";

// Matches SMT.Domain.BoardFlow.V2.BoardMovementStatusV2 - this labels the
// outcome of a single scan event, not the board's current overall status.
const MOVEMENT_STATUS_LABEL = {
  0: { key: "boardReportV2.movementStatus.passed", className: "bg-success" },
  1: {
    key: "boardReportV2.movementStatus.flaggedMissingPrevious",
    className: "bg-danger",
  },
  2: { key: "boardReportV2.movementStatus.deleted", className: "bg-secondary" },
};

let nextRowKey = 0;

class BoardReportV2 extends Form {
  barcodeRef = React.createRef();

  state = {
    fields: { qrCode: "" },
    scans: [],
    errors: {},
    loading: true,
    selectedReader: "",
    readers: [],
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedReader !== this.state.selectedReader) {
      this.setFocusOnBarcode();
    }
  }

  setFocusOnBarcode() {
    if (this.barcodeRef.current) this.barcodeRef.current.focus();
  }

  async componentDidMount() {
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      const [{ data: readers }, { data: movements }] = await Promise.all([
        getQrReadersV2(null, true),
        getRecentMovements(today),
      ]);

      const scans = movements.map((m) => ({
        key: nextRowKey++,
        time: format(new Date(m.dateTime), "yyyy-MM-dd HH:mm:ss"),
        qrCode: m.qrCode,
        status: m.status,
        modelName: m.modelName,
        readerId: m.qrReaderId,
        stationLabel: `${m.lineName || ""} · ${m.qrReaderName || ""}`,
      }));

      this.setState({ readers, scans });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  selectReader = (id) => {
    this.setState({ selectedReader: id });
  };

  handleImportKeyPress = async (e) => {
    if (e.key !== "Enter") return;

    const { selectedReader, scans, readers } = this.state;
    const qrCode = e.target.value;

    if (!selectedReader || !qrCode) return;

    const alreadyReported = scans.some(
      (s) => s.qrCode === qrCode && String(s.readerId) === String(selectedReader)
    );
    if (alreadyReported) {
      const reader = readers.find((r) => String(r.id) === String(selectedReader));
      const { t } = this.props;
      toast.error(
        t("boardReportV2.alreadyReported", {
          qrCode,
          station: reader ? reader.name : t("boardReportV2.thisStation"),
        })
      );
      this.setState({ fields: { qrCode: "" } });
      return;
    }

    this.setState({ loading: true });
    try {
      const { data: board } = await scanBoard(qrCode, selectedReader);
      const reader = readers.find((r) => String(r.id) === String(selectedReader));
      const scan = {
        key: nextRowKey++,
        time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        qrCode,
        status: board.status === 1 ? 1 : 0, // Flagged -> MissingPreviousPass, else Passed
        modelName: board.model ? board.model.name : "",
        readerId: selectedReader,
        stationLabel: reader
          ? `${reader.line ? reader.line.name : ""} · ${reader.name}`
          : "",
      };
      this.setState({ scans: [scan, ...scans] });
    } catch (ex) {
      toast.error(
        (ex.response && ex.response.data && ex.response.data.message) ||
          ex.message
      );
    } finally {
      this.setState({ loading: false, fields: { qrCode: "" } });
    }
  };

  render() {
    const { loading, fields, errors, readers, scans, selectedReader } =
      this.state;
    const { t } = this.props;

    const stages = buildStages(readers);
    const selected = readers.find((r) => String(r.id) === String(selectedReader));
    const totalBoards = new Set(scans.map((s) => s.qrCode)).size;

    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}

        <div className="col-12">
          <h5>{t("boardReportV2.processTitle")}</h5>
          <p className="text-muted small">
            {t("boardReportV2.processHint")}
          </p>
          <div className="d-flex align-items-stretch mb-3" style={{ overflowX: "auto" }}>
            {stages.map((stage, stageIndex) => (
              <React.Fragment key={stageIndex}>
                <div className="d-flex flex-column justify-content-center">
                  {stage.map((r) => {
                    const isSelected = String(r.id) === String(selectedReader);
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => this.selectReader(r.id)}
                        className={`btn btn-sm m-1 text-start ${
                          isSelected ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        style={{ minWidth: "150px" }}
                      >
                        <div className="small fw-bold">
                          {r.line ? r.line.name : ""}
                        </div>
                        <div>{r.name}</div>
                      </button>
                    );
                  })}
                </div>
                {stageIndex < stages.length - 1 && (
                  <div className="d-flex align-items-center px-1 text-muted">
                    &rarr;
                  </div>
                )}
              </React.Fragment>
            ))}
            {stages.length === 0 && (
              <div className="text-muted small">
                {t("shared.noStationsConfigured")}
              </div>
            )}
          </div>
        </div>

        <div className="col-12">
          <label>
            {t("boardReportV2.scanningAt")}{" "}
            {selected ? (
              <strong>
                {selected.line ? selected.line.name : ""} · {selected.name}
              </strong>
            ) : (
              <span className="text-danger">
                {t("boardReportV2.noStationSelected")}
              </span>
            )}
          </label>
          {this.renderInput(
            "qrCode",
            "",
            t("boardReportV2.scanPlaceholder"),
            fields.qrCode,
            this.handleInputChange,
            errors.qrCode,
            true,
            "text",
            this.barcodeRef,
            false,
            this.handleImportKeyPress
          )}
          <p className="mt-2"> </p>
        </div>

        <div className="col-12 mt-3 d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{t("boardReportV2.todaysReport")}</h5>
          <span className="badge bg-primary fs-6">
            {t("boardReportV2.totalBoards", { count: totalBoards })}
          </span>
        </div>

        <div className="col-12 mt-3">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{t("boardReportV2.columns.time")}</th>
                <th>{t("boardReportV2.columns.qrCode")}</th>
                <th>{t("boardReportV2.columns.model")}</th>
                <th>{t("boardReportV2.columns.station")}</th>
                <th>{t("boardReportV2.columns.status")}</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => {
                const status = MOVEMENT_STATUS_LABEL[s.status] || {
                  key: null,
                  className: "bg-secondary",
                };
                return (
                  <tr key={s.key}>
                    <td>{s.time}</td>
                    <td>{s.qrCode}</td>
                    <td>{s.modelName}</td>
                    <td>{s.stationLabel}</td>
                    <td>
                      <span className={`badge ${status.className}`}>
                        {status.key ? t(status.key) : s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {scans.length === 0 && (
                <tr>
                  <td colSpan="5">{t("boardReportV2.noBoardsToday")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default withTranslation(["boardFlow", "common"])(BoardReportV2);
