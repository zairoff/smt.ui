import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { withTranslation } from "react-i18next";
import Form from "../../forms/form";
import {
  getAllLineSnapshots,
  getFlaggedBoards,
  getBoardHistory,
  getBoardsAtStation,
} from "../../../services/board-flow/boardV2Service";
import { getQrReadersV2 } from "../../../services/board-flow/qrReaderV2Service";
import { buildStages, terminalReaderIds } from "../../../utils/boardFlowStages";
import BoardHistoryModal from "./boardHistoryModal";
import StationBoardsModal from "./stationBoardsModal";

const POLL_INTERVAL_MS = 20000;

class LineFlowBoard extends Form {
  state = {
    fields: { from: "", to: "" },
    readers: [],
    snapshots: [],
    flaggedBoards: [],
    loading: false,
    historyQrCode: "",
    showHistory: false,
    historyLoading: false,
    historyData: null,
    showStationBoards: false,
    stationBoardsName: "",
    stationBoardsLoading: false,
    stationBoards: [],
  };

  async componentDidMount() {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(new Date(), "yyyy-MM-dd");

    this.setState({ fields: { from, to } });

    try {
      const { data: readers } = await getQrReadersV2(null, true);
      this.setState({ readers });
    } catch (ex) {
      toast.error(ex.message);
    }

    await this.fetchAll(from, to);
    this.startPolling();
  }

  componentWillUnmount() {
    this.stopPolling();
  }

  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      const { fields } = this.state;
      this.fetchAll(fields.from, fields.to, true);
    }, POLL_INTERVAL_MS);
  }

  stopPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  fetchAll = async (from, to, silent = false) => {
    if (!from || !to) return;

    if (!silent) this.setState({ loading: true });
    try {
      const [{ data: snapshots }, { data: flaggedBoards }] = await Promise.all([
        getAllLineSnapshots(from, to),
        getFlaggedBoards(null),
      ]);
      this.setState({ snapshots, flaggedBoards });
    } catch (ex) {
      if (!silent) toast.error(ex.message);
    } finally {
      if (!silent) this.setState({ loading: false });
    }
  };

  doSubmit = async () => {
    const { from, to } = this.state.fields;

    if (!from || !to) return;

    await this.fetchAll(from, to);
  };

  openHistory = async (qrCode) => {
    if (!qrCode) return;

    this.setState({ showHistory: true, historyLoading: true, historyData: null });
    try {
      const { data } = await getBoardHistory(qrCode);
      this.setState({ historyData: data, historyLoading: false });
    } catch (ex) {
      this.setState({ historyLoading: false });
      toast.error(
        (ex.response && ex.response.data && ex.response.data.message) ||
          ex.message
      );
    }
  };

  closeHistory = () => {
    this.setState({ showHistory: false });
  };

  handleHistorySearchSubmit = (e) => {
    e.preventDefault();
    this.openHistory(this.state.historyQrCode);
  };

  openStationBoards = async (reader) => {
    const stationBoardsName = `${reader.line ? reader.line.name : ""} · ${reader.name}`;

    this.setState({
      showStationBoards: true,
      stationBoardsName,
      stationBoardsLoading: true,
      stationBoards: [],
    });
    try {
      const { data } = await getBoardsAtStation(reader.id);
      this.setState({ stationBoards: data, stationBoardsLoading: false });
    } catch (ex) {
      this.setState({ stationBoardsLoading: false });
      toast.error(
        (ex.response && ex.response.data && ex.response.data.message) ||
          ex.message
      );
    }
  };

  closeStationBoards = () => {
    this.setState({ showStationBoards: false });
  };

  selectBoardFromStation = (qrCode) => {
    this.setState({ showStationBoards: false });
    this.openHistory(qrCode);
  };

  render() {
    const {
      fields,
      readers,
      snapshots,
      flaggedBoards,
      loading,
      historyQrCode,
      showHistory,
      historyLoading,
      historyData,
      showStationBoards,
      stationBoardsName,
      stationBoardsLoading,
      stationBoards,
    } = this.state;
    const { t } = this.props;

    const stages = buildStages(readers);
    const terminalIds = terminalReaderIds(readers);

    const stationCounts = {};
    const completedByLine = {};
    snapshots.forEach((snap) => {
      completedByLine[snap.lineId] = snap.completedCount;
      snap.stations.forEach((s) => {
        stationCounts[s.readerId] = s;
      });
    });

    return (
      <div className="full-bleed">
        <div className="container-fluid px-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}

          <form className="border p-4 mt-2 mb-4" onSubmit={this.handleSubmit}>
            <div className="row align-items-end">
              <div className="col">
                {this.renderInput(
                  "from",
                  t("lineFlowBoard.completedSince"),
                  "",
                  fields.from,
                  this.handleInputChange,
                  "",
                  true,
                  "date"
                )}
              </div>
              <div className="col">
                {this.renderInput(
                  "to",
                  t("lineFlowBoard.completedUntil"),
                  "",
                  fields.to,
                  this.handleInputChange,
                  "",
                  true,
                  "date"
                )}
              </div>
              <div className="col-2">
                {this.renderButton(t("lineFlowBoard.refreshButton"))}
              </div>
            </div>
          </form>

          <h5>{t("lineFlowBoard.wholeProcessTitle")}</h5>
          <p className="text-muted small">{t("lineFlowBoard.wholeProcessHint")}</p>

          <div className="d-flex align-items-stretch" style={{ overflowX: "auto" }}>
            {stages.map((stage, stageIndex) => (
              <React.Fragment key={stageIndex}>
                <div className="d-flex flex-column justify-content-center">
                  {stage.map((r) => {
                    const counts = stationCounts[r.id] || {
                      inProgressCount: 0,
                      flaggedCount: 0,
                    };
                    const isTerminal = terminalIds.has(r.id);

                    return (
                      <div
                        className="card m-2 text-center"
                        style={{ minWidth: "160px", cursor: "pointer" }}
                        key={r.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => this.openStationBoards(r)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") this.openStationBoards(r);
                        }}
                      >
                        <div className="card-body">
                          <div className="text-muted small">
                            {r.line ? r.line.name : ""} · {r.name}
                          </div>
                          <div className="fs-3 fw-bold text-primary mt-2">
                            {counts.inProgressCount}
                          </div>
                          <div className="small text-muted">
                            {t("lineFlowBoard.inTransit")}
                          </div>
                          {counts.flaggedCount > 0 && (
                            <div className="fs-5 fw-bold text-danger mt-2">
                              {t("lineFlowBoard.flaggedCount", {
                                count: counts.flaggedCount,
                              })}
                            </div>
                          )}
                          {isTerminal && (
                            <div className="mt-2 pt-2 border-top">
                              <div className="fs-5 fw-bold text-success">
                                {completedByLine[r.lineId] || 0}
                              </div>
                              <div className="small text-muted">
                                {t("lineFlowBoard.completedInRange")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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

          <div className="row mt-4">
            <div className="col-md-4">
              <form onSubmit={this.handleHistorySearchSubmit}>
                <label htmlFor="historyQrCode">
                  {t("lineFlowBoard.lookupTitle")}
                </label>
                <div className="d-flex">
                  <input
                    id="historyQrCode"
                    className="form-control me-2"
                    value={historyQrCode}
                    onChange={(e) =>
                      this.setState({ historyQrCode: e.target.value })
                    }
                  />
                  <button type="submit" className="btn btn-secondary">
                    {t("lineFlowBoard.viewButton")}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-4">
            <h5>
              {t("lineFlowBoard.flaggedBoardsTitle")}{" "}
              {flaggedBoards.length > 0 && `(${flaggedBoards.length})`}
            </h5>
            <p className="text-muted small">
              {t("lineFlowBoard.flaggedBoardsHint")}
            </p>
            {flaggedBoards.length === 0 && (
              <p className="mb-0">{t("lineFlowBoard.noFlaggedBoards")}</p>
            )}
            {flaggedBoards.length > 0 && (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>{t("lineFlowBoard.columns.line")}</th>
                    <th>{t("lineFlowBoard.columns.qrCode")}</th>
                    <th>{t("lineFlowBoard.columns.model")}</th>
                    <th>{t("lineFlowBoard.columns.currentStation")}</th>
                    <th>{t("lineFlowBoard.columns.lastUpdated")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedBoards.map((b) => (
                    <tr key={b.id}>
                      <td>{b.line ? b.line.name : ""}</td>
                      <td>{b.qrCode}</td>
                      <td>{b.model ? b.model.name : ""}</td>
                      <td>
                        {b.currentQrReader ? b.currentQrReader.name : ""}
                      </td>
                      <td>
                        {format(new Date(b.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => this.openHistory(b.qrCode)}
                        >
                          {t("shared.historyButton")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <BoardHistoryModal
          show={showHistory}
          loading={historyLoading}
          data={historyData}
          onClose={this.closeHistory}
        />

        <StationBoardsModal
          show={showStationBoards}
          loading={stationBoardsLoading}
          stationName={stationBoardsName}
          boards={stationBoards}
          onClose={this.closeStationBoards}
          onSelectBoard={this.selectBoardFromStation}
        />
      </div>
    );
  }
}

export default withTranslation(["boardFlow", "common"])(LineFlowBoard);
