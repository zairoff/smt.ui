import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class FtqPlanTable extends Component {
  get columns() {
    return [
    { path: "model.name", label: this.props.t("tables:ftqPlanTable.columns.model") },
    { path: "model.sapCode", label: this.props.t("tables:ftqPlanTable.columns.sap") },
    { path: "requiredCount", label: this.props.t("tables:ftqPlanTable.columns.requiredCount") },
    { path: "producedCount", label: this.props.t("tables:ftqPlanTable.columns.producedCount") },
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

export default withTranslation("tables")(FtqPlanTable);
