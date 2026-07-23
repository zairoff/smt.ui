import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class PlanActivityReportTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:planActivityReportTable.columns.id") },
    { path: "line.name", label: this.props.t("tables:planActivityReportTable.columns.line") },
    { path: "date", label: this.props.t("tables:planActivityReportTable.columns.dateEntered") },
    { path: "issue", label: this.props.t("tables:planActivityReportTable.columns.issue") },
    { path: "reason", label: this.props.t("tables:planActivityReportTable.columns.reason") },
    { path: "act", label: this.props.t("tables:planActivityReportTable.columns.correctiveAction") },
    { path: "expires", label: this.props.t("tables:planActivityReportTable.columns.deadline") },
    { path: "responsible", label: this.props.t("tables:planActivityReportTable.columns.responsible") },
    { path: "status", label: this.props.t("tables:planActivityReportTable.columns.status") },
  ];
  }
  render() {
    const { rows, sortColumn, onSort } = this.props;
    return (
      <Table
        columns={this.columns}
        rows={rows}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default withTranslation(["tables", "common"])(PlanActivityReportTable);
