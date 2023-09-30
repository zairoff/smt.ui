import React, { Component } from "react";
import Table from "../common/table";

class PlanTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "line.name", label: "LINE" },
    { path: "model.name", label: "MODEL" },
    { path: "shift", label: "SMENA" },
    { path: "employee", label: "XODIM" },
    { path: "requiredCount", label: "REJA" },
    { path: "producedCount", label: "ISHLAB CHIQARILDI" },
    { path: "date", label: "SANA" },
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
