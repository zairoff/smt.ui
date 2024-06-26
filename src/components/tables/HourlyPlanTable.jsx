import React, { Component } from "react";
import Table from "../common/table";

class HourlyPlanTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "line.name", label: "LINE" },
    { path: "model.name", label: "MODEL" },
    { path: "plan", label: "PLAN" },
    { path: "produced", label: "PRODUCED" },
    { path: "time", label: "DATE" },
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

export default HourlyPlanTable;
