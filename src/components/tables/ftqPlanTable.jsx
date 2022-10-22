import React, { Component } from "react";
import Table from "../common/table";

class FtqPlanTable extends Component {
  columns = [
    { path: "model.name", label: "MODEL" },
    { path: "requiredCount", label: "PLAN" },
    { path: "producedCount", label: "PRODUCED" },
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

export default FtqPlanTable;
