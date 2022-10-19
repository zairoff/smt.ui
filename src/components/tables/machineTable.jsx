import React, { Component } from "react";
import Table from "../common/table";
import config from "../../config.json";

const fileUrl = config.fileUrl;

class MachineTable extends Component {
  columns = [
    {
      path: "image",
      content: (machine) => (
        <img
          src={fileUrl + machine.imageUrl}
          className="rounded"
          style={{ height: "100px", width: "100px", objectFit: "cover" }}
        ></img>
      ),
    },
    { path: "name", label: "" },
    {
      path: "button",
      content: (machine) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(machine)}
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

export default MachineTable;
