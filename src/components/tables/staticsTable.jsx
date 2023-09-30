import React, { Component } from "react";
import Table from "../common/table";

class StaticsTable extends Component {
  columns = [
    { path: "model", label: "MODEL" },
    { path: "line", label: "LINE" },
    { path: "defect", label: "NUQSON" },
    { path: "shift", label: "SMENA" },
    { path: "date", label: "SANA" },
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
