import React, { Component } from "react";
import Table from "../common/table";

class StaticsTable extends Component {
  columns = [
    { path: "product", label: "PRODUCT" },
    { path: "brand", label: "BRAND" },
    { path: "model", label: "MODEL" },
    { path: "line", label: "LINE" },
    { path: "defect", label: "DEFECT" },
    { path: "action", label: "ACTION" },
    { path: "condition", label: "CONDITION" },
    { path: "createdDate", label: "CREATED" },
    { path: "updatedDate", label: "UPDATED" },
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

export default StaticsTable;
