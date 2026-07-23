import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class RepairHistoryTable extends Component {
  get columns() {
    return [
    { path: "barcode", label: this.props.t("tables:repairHistoryTable.columns.barcode") },
    { path: "model", label: this.props.t("tables:repairHistoryTable.columns.model") },
    { path: "line", label: this.props.t("tables:repairHistoryTable.columns.line") },
    { path: "defect", label: this.props.t("tables:repairHistoryTable.columns.defect") },
    { path: "action", label: this.props.t("tables:repairHistoryTable.columns.actionPerformed") },
    { path: "employee", label: this.props.t("tables:repairHistoryTable.columns.performedBy") },
    { path: "condition", label: this.props.t("tables:repairHistoryTable.columns.condition") },
    { path: "createdDate", label: this.props.t("tables:repairHistoryTable.columns.loggedAt") },
    { path: "updatedDate", label: this.props.t("tables:repairHistoryTable.columns.updatedAt") },
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

export default withTranslation("tables")(RepairHistoryTable);
