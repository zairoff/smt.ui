import React, { Component } from "react";
import Table from "../common/table";
import config from "../../config.json";

const fileUrl = config.fileUrl;

class PlannerTable extends Component {
  columns = [
    {
      path: "image",
      content: (planner) => (
        <img
          src={fileUrl + planner.employee.imageUrl}
          className="rounded-circle"
          style={{ height: "65px", width: "65px", objectFit: "cover" }}
        ></img>
      ),
    },
    { path: "employee.fullName", label: "NAME" },
    { path: "line.name", label: "LINE" },
    {
      path: "delete",
      content: (repairer) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(repairer)}
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

export default PlannerTable;
