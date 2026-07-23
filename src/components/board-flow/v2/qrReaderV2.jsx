import React from "react";
import Pagination from "../../common/pagination";
import { paginate } from "../../../utils/paginate";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../../forms/form";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import {
  addQrReaderV2,
  deleteQrReaderV2,
  getQrReadersV2,
} from "../../../services/board-flow/qrReaderV2Service";
import { getLines } from "../../../services/lineService";

class QrReaderV2 extends Form {
  state = {
    sortColumn: { path: "position", order: "asc" },
    fields: { lineId: "", name: "", position: "" },
    selectedPreviousIds: [],
    currentPage: 1,
    pageSize: 15,
    data: [],
    lines: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const [{ data }, { data: lines }] = await Promise.all([
        getQrReadersV2(),
        getLines(),
      ]);
      this.setState({ data, lines });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  togglePreviousReader = (id) => {
    const { selectedPreviousIds } = this.state;
    const exists = selectedPreviousIds.includes(id);
    const next = exists
      ? selectedPreviousIds.filter((x) => x !== id)
      : [...selectedPreviousIds, id];
    this.setState({ selectedPreviousIds: next });
  };

  doSubmit = async () => {
    const { data, fields, selectedPreviousIds } = this.state;

    const { t } = this.props;
    if (!fields.lineId) {
      this.setState({
        errors: { ...this.state.errors, lineId: t("qrReaderV2.lineRequired") },
      });
      return;
    }
    if (!fields.position) {
      this.setState({
        errors: {
          ...this.state.errors,
          position: t("qrReaderV2.positionRequired"),
        },
      });
      return;
    }

    this.setState({ loading: true });
    try {
      const { data: result } = await addQrReaderV2({
        lineId: fields.lineId,
        name: fields.name,
        position: fields.position,
        previousReaderIds: selectedPreviousIds,
      });
      const newData = [result, ...data];
      this.setState({
        data: newData,
        fields: { lineId: "", name: "", position: "" },
        selectedPreviousIds: [],
      });
    } catch (ex) {
      this.catchExceptionMessage(ex, "name");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deleteQrReaderV2(id);
    } catch (ex) {
      this.setState({ data: clone });
      this.catchExceptionMessage(ex, "name");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize === 0;
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const {
      data: allRows,
      lines,
      pageSize,
      currentPage,
      sortColumn,
      loading,
      fields,
      errors,
      selectedPreviousIds,
    } = this.state;
    const { t } = this.props;

    const sortedRows = _.orderBy(
      allRows,
      [sortColumn.path],
      [sortColumn.order]
    );
    const rows = paginate(sortedRows, currentPage, pageSize);

    // Any active station on any line can be picked as a predecessor - this is
    // what lets a station be a convergence point fed by more than one line
    // (e.g. the PCB line's entry station, fed by both the Parmi and Jutze SMD lines).
    const readersByLine = _.groupBy(allRows, (r) => (r.line ? r.line.name : ""));

    return (
      <form className="m-2 row" onSubmit={this.handleSubmit}>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col mt-4">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{t("qrReaderV2.columns.line")}</th>
                <th>{t("qrReaderV2.columns.position")}</th>
                <th>{t("qrReaderV2.columns.name")}</th>
                <th>{t("qrReaderV2.columns.previousStations")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.line ? r.line.name : ""}</td>
                  <td>{r.position}</td>
                  <td>{r.name}</td>
                  <td>
                    {r.previousReaders && r.previousReaders.length > 0
                      ? r.previousReaders
                          .map((p) => `${p.lineName} - ${p.name}`)
                          .join(", ")
                      : t("qrReaderV2.entryStation")}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => this.handleDelete({ id: r.id })}
                    >
                      {t("common:buttons.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            itemsCount={allRows.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-5">
          <h5>{t("qrReaderV2.addStationTitle")}</h5>
          {this.renderSelect(
            "lineId",
            lines,
            errors.lineId,
            this.handleInputChange
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "name",
            t("qrReaderV2.nameLabel"),
            "",
            fields.name,
            this.handleInputChange,
            errors.name,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "position",
            t("qrReaderV2.positionLabel"),
            "",
            fields.position,
            this.handleInputChange,
            errors.position,
            true,
            "number"
          )}
          <p className="mt-2"> </p>

          <label>{t("qrReaderV2.columns.previousStations")}</label>
          <p className="text-muted small mb-1">
            {t("qrReaderV2.previousStationsHint")}
          </p>
          <div
            className="border rounded p-2 mb-3"
            style={{ maxHeight: "220px", overflowY: "auto" }}
          >
            {Object.keys(readersByLine).length === 0 && (
              <div className="text-muted small">
                {t("qrReaderV2.noStationsYet")}
              </div>
            )}
            {Object.keys(readersByLine).map((lineName) => (
              <div key={lineName} className="mb-2">
                <div className="fw-bold small">{lineName}</div>
                {readersByLine[lineName].map((r) => (
                  <div className="form-check" key={r.id}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`prev-${r.id}`}
                      checked={selectedPreviousIds.includes(r.id)}
                      onChange={() => this.togglePreviousReader(r.id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`prev-${r.id}`}
                    >
                      {r.position}. {r.name}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {this.renderButton(t("common:buttons.save"))}
        </div>
      </form>
    );
  }
}

export default withTranslation(["boardFlow", "common"])(QrReaderV2);
