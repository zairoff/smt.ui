import React, { Component } from "react";
import Table from "../common/table";

class StaticsGroupedTable extends Component {
  columns = [
    { path: "name", label: "NAME" },
    { path: "count", label: "COUNT" },
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

export default StaticsGroupedTable;
