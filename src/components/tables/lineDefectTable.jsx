import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class LineDefectTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:lineDefectTable.columns.id") },
    { path: "line.name", label: this.props.t("tables:lineDefectTable.columns.line") },
    { path: "defect.name", label: this.props.t("tables:lineDefectTable.columns.defect") },
    {
      path: "button",
      content: (productBrand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(productBrand)}
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

export default withTranslation(["tables", "common"])(LineDefectTable);
