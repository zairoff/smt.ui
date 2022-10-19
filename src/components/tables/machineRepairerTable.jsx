import React, { Component } from "react";
import Table from "../common/table";
import config from "../../config.json";

const fileUrl = config.fileUrl;

class MachineRepairerTable extends Component {
  columns = [
    {
      path: "image",
      content: (machinerepairer) => (
        <img
          src={fileUrl + machinerepairer.employee.imageUrl}
          className="rounded-circle"
          style={{ height: "65px", width: "65px", objectFit: "cover" }}
        ></img>
      ),
    },
    { path: "employee.fullName", label: "" },
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

export default MachineRepairerTable;
