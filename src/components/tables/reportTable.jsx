import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ReportTable extends Component {
  get columns() {
    return [
    { path: "barcode", label: this.props.t("tables:reportTable.columns.barcode") },
    { path: "model.name", label: this.props.t("tables:reportTable.columns.model") },
    { path: "defect.name", label: this.props.t("tables:reportTable.columns.defect") },
    {
      path: "button",
      content: (report) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(report)}
          className="btn btn-danger"
        >
          {this.props.t("common:buttons.delete")}
        </button>
      ),
    },
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

export default withTranslation(["tables", "common"])(ReportTable);
