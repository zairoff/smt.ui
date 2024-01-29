import React, { Component } from "react";
import Table from "../common/table";

class ReturnProductGroupByTable extends Component {
  render() {
    const { rows, sortColumn, onSort } = this.props;

    const columns = [
      { path: "model", label: "MODEL" },
      { path: "sapCode", label: "SAP CODE" },
      { path: "barCode", label: "BAR CODE" },
      { path: "count", label: "SONI" },
    ];

    return (
      <Table
        columns={columns}
        rows={rows}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ReturnProductGroupByTable;
