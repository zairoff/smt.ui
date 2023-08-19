import React, { Component } from "react";
import Table from "../common/table";

class StaticsTable extends Component {
  columns = [
    { path: "model", label: "MODEL" },
    { path: "defect", label: "DEFECT" },
    { path: "line", label: "LINE" },
    { path: "shift", label: "SHIFT" },
    { path: "date", label: "DATE" },
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
