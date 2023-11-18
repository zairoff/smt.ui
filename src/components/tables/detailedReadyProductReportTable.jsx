import React, { Component } from "react";
import Table from "../common/table";

class DetailedReadyProductReportTable extends Component {
  render() {
    const { rows, sortColumn, onSort } = this.props;

    const columns = [
      { path: "model.name", label: "MODEL" },
      { path: "model.sapCode", label: "SAP CODE" },
      { path: "count", label: "SONI" },
      { path: "status", label: "STATUS" },
      { path: "date", label: "SANA" },
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

export default DetailedReadyProductReportTable;
