import React, { Component } from "react";
import Table from "../common/table";

class MachineRepairTable extends Component {
  columns = [
    { path: "machine.name", label: "" },
    { path: "issue", label: "" },
    { path: "action", label: "" },
    { path: "createdDate", label: "" },
    { path: "notificationDate", label: "" },
    { path: "employee.fullName", label: "" },
    {
      path: "button",
      content: (brand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(brand)}
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

export default MachineRepairTable;
