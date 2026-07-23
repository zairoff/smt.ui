import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class LineTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:lineTable.columns.id") },
    { path: "name", label: this.props.t("tables:lineTable.columns.name") },
    {
      path: "button",
      content: (brand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(brand)}
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

export default withTranslation(["tables", "common"])(LineTable);
