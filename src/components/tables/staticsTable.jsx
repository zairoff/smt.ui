import React, { Component } from "react";
import Table from "../common/table";

class StaticsTable extends Component {
  columns = [
    { path: "barcode", label: "BARCODE" },
    { path: "product", label: "PRODUCT" },
    { path: "brand", label: "BRAND" },
    { path: "model", label: "MODEL" },
    { path: "line", label: "LINE" },
    { path: "defect", label: "DEFECT" },
    { path: "action", label: "BAJARILDI" },
    { path: "employee", label: "BAJARDI" },
    { path: "condition", label: "XOLATI" },
    { path: "createdDate", label: "KIRITILDI" },
    { path: "updatedDate", label: "TO'G'IRLANDI" },
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
