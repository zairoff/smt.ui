import React, { Component } from "react";
import _ from "lodash";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { getLines } from "../../services/lineService";
import { getAllComponentRequests } from "../../services/componentRequestService";

const STATUS_BADGE = {
  Requested: "bg-warning text-dark",
  Transferred: "bg-success",
  NotFound: "bg-danger",
};

class ComponentRequestReport extends Component {
  state = {
    requests: [],
    lines: [],
    lineFilter: "",
    fromDate: "",
    toDate: "",
    sortColumn: { path: "", order: "asc" },
    loading: false,
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  async componentDidMount() {
    this.setState({ loading: true });
    try {
      const [{ data: requests }, { data: lines }] = await Promise.all([
        getAllComponentRequests(),
        getLines(),
      ]);
      this.setState({ requests, lines });
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  }

  handleLineFilterChange = ({ currentTarget }) => {
    this.setState({ lineFilter: currentTarget.value });
  };

  handleFromDateChange = ({ currentTarget }) => {
    this.setState({ fromDate: currentTarget.value });
  };

  handleToDateChange = ({ currentTarget }) => {
    this.setState({ toDate: currentTarget.value });
  };

  get filteredRequests() {
    const { requests, lineFilter, fromDate, toDate } = this.state;

    return requests.filter((r) => {
      if (lineFilter && String(r.lineId) !== lineFilter) return false;

      // createdDate is formatted "yyyy-MM-dd HH:mm" by the backend, so the
      // first 10 chars sort/compare correctly against the <input type="date">
      // values without any Date parsing/timezone conversion.
      const requestDate = (r.createdDate || "").slice(0, 10);
      if (fromDate && requestDate < fromDate) return false;
      if (toDate && requestDate > toDate) return false;

      return true;
    });
  }

  get rows() {
    return this.filteredRequests.flatMap((r) =>
      (r.items || []).map((i) => ({
        id: i.id,
        lineName: r.lineName,
        createdDate: r.createdDate,
        rCode: i.rCode,
        partNumber: i.partNumber,
        status: i.status,
        transferredDate: i.transferredDate,
        durationMinutes: i.durationMinutes,
      }))
    );
  }

  get stats() {
    const requests = this.filteredRequests;
    const rows = this.rows;

    const transferred = rows.filter((r) => r.status === "Transferred");
    const notFound = rows.filter((r) => r.status === "NotFound");
    const pending = rows.filter((r) => r.status === "Requested");

    const avgDuration =
      transferred.length > 0
        ? transferred.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) /
          transferred.length
        : null;

    return {
      totalRequests: requests.length,
      totalItems: rows.length,
      transferredCount: transferred.length,
      notFoundCount: notFound.length,
      pendingCount: pending.length,
      avgDuration,
    };
  }

  renderStatTile(label, value, colorClass) {
    return (
      <div className="col">
        <div className="card text-center h-100">
          <div className="card-body">
            <div className="text-muted small">{label}</div>
            <div className={`fs-3 fw-semibold ${colorClass || ""}`}>
              {value}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { lines, lineFilter, fromDate, toDate, loading, sortColumn } =
      this.state;
    const stats = this.stats;

    const columns = [
      { path: "lineName", label: t("componentRequestReport.line") },
      { path: "rCode", label: t("componentRequestReport.rCode") },
      { path: "partNumber", label: t("componentRequestReport.partNumber") },
      {
        path: "status",
        label: t("componentRequestReport.status"),
        content: (row) => (
          <span
            className={`badge ${STATUS_BADGE[row.status] || "bg-secondary"}`}
          >
            {t(`componentRequestReport.statusLabels.${row.status}`)}
          </span>
        ),
      },
      { path: "createdDate", label: t("componentRequestReport.requested") },
      {
        path: "transferredDate",
        label: t("componentRequestReport.transferred"),
      },
      {
        path: "durationMinutes",
        label: t("componentRequestReport.duration"),
        content: (row) =>
          row.durationMinutes != null
            ? t("componentRequestReport.durationValue", {
                value: row.durationMinutes,
              })
            : "—",
      },
    ];

    const rows = _.orderBy(this.rows, [sortColumn.path], [sortColumn.order]);

    return (
      <div className="m-2">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}

        <div className="row g-3 mb-4">
          {this.renderStatTile(
            t("componentRequestReport.totalRequests"),
            stats.totalRequests
          )}
          {this.renderStatTile(
            t("componentRequestReport.totalItems"),
            stats.totalItems
          )}
          {this.renderStatTile(
            t("componentRequestReport.transferred"),
            stats.transferredCount,
            "text-success"
          )}
          {this.renderStatTile(
            t("componentRequestReport.notFound"),
            stats.notFoundCount,
            "text-danger"
          )}
          {this.renderStatTile(
            t("componentRequestReport.pending"),
            stats.pendingCount,
            "text-warning"
          )}
          {this.renderStatTile(
            t("componentRequestReport.avgDuration"),
            stats.avgDuration != null
              ? t("componentRequestReport.durationValue", {
                  value: Math.round(stats.avgDuration * 10) / 10,
                })
              : "—"
          )}
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">
              {t("componentRequestReport.line")}
            </label>
            <select
              className="form-control form-control-lg"
              value={lineFilter}
              onChange={this.handleLineFilterChange}
            >
              <option value="">{t("componentRequestReport.allLines")}</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">
              {t("componentRequestReport.fromDate")}
            </label>
            <input
              type="date"
              className="form-control form-control-lg"
              value={fromDate}
              max={toDate || undefined}
              onChange={this.handleFromDateChange}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              {t("componentRequestReport.toDate")}
            </label>
            <input
              type="date"
              className="form-control form-control-lg"
              value={toDate}
              min={fromDate || undefined}
              onChange={this.handleToDateChange}
            />
          </div>
        </div>

        <Table
          columns={columns}
          rows={rows}
          sortColumn={sortColumn}
          onSort={this.handleSort}
        />
      </div>
    );
  }
}

export default withTranslation("store")(ComponentRequestReport);
