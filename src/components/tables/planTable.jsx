import React, { Component } from "react";
import Table from "../common/table";

class PlanTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "line.name", label: "LINE" },
    { path: "model.name", label: "MODEL" },
    { path: "shift", label: "SHIFT" },
    { path: "employee", label: "PLANNER" },
    { path: "requiredCount", label: "PLAN" },
    { path: "producedCount", label: "PRODUCED" },
    { path: "date", label: "DATE" },
    {
      path: "button",
      content: (productBrand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(productBrand)}
          className="btn btn-danger"
        >
          Delete
        </button>
      ),
    },
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

export default PlanTable;
