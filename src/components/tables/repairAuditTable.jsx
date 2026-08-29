import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class RepairAuditTable extends Component {
  columns = [
    { path: "barcode", label: this.props.t("repairAudit:report.columns.barcode") },
    { path: "modelName", label: this.props.t("repairAudit:report.columns.model") },
    { path: "sapCode", label: this.props.t("repairAudit:report.columns.sapCode") },
    { path: "employee", label: this.props.t("repairAudit:report.columns.employee") },
    {
      path: "firstScannedDate",
      label: this.props.t("repairAudit:report.columns.firstScannedDate"),
    },
    {
      path: "lastConfirmedDate",
      label: this.props.t("repairAudit:report.columns.lastConfirmedDate"),
    },
    {
      path: "delete",
      content: (repairAudit) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(repairAudit)}
          className="btn btn-danger"
        >
          {this.props.t("common:buttons.delete")}
        </button>
      ),
    },
  ];

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

export default withTranslation(["repairAudit", "common"])(RepairAuditTable);
