import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ComponentTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:componentTable.columns.id") },
    { path: "partNumber", label: this.props.t("tables:componentTable.columns.partNumber") },
    { path: "rCode", label: this.props.t("tables:componentTable.columns.rCode") },
    { path: "storePlaceNumber", label: this.props.t("tables:componentTable.columns.storePlace") },
    { path: "sapPlace", label: this.props.t("tables:componentTable.columns.sapPlace") },
    {
      path: "button",
      content: (component) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(component)}
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

export default withTranslation(["tables", "common"])(ComponentTable);
