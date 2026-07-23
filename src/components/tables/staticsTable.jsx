import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class StaticsTable extends Component {
  get columns() {
    return [
    { path: "barcode", label: this.props.t("tables:staticsTable.columns.barcode") },
    { path: "product", label: this.props.t("tables:staticsTable.columns.product") },
    { path: "brand", label: this.props.t("tables:staticsTable.columns.brand") },
    { path: "model", label: this.props.t("tables:staticsTable.columns.model") },
    { path: "line", label: this.props.t("tables:staticsTable.columns.line") },
    { path: "defect", label: this.props.t("tables:staticsTable.columns.defect") },
    { path: "action", label: this.props.t("tables:staticsTable.columns.actionPerformed") },
    { path: "employee", label: this.props.t("tables:staticsTable.columns.performedBy") },
    { path: "condition", label: this.props.t("tables:staticsTable.columns.condition") },
    { path: "createdDate", label: this.props.t("tables:staticsTable.columns.loggedAt") },
    { path: "updatedDate", label: this.props.t("tables:staticsTable.columns.fixedAt") },
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

export default withTranslation("tables")(StaticsTable);
