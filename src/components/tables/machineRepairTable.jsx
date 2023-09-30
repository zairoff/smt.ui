import React, { Component } from "react";
import Table from "../common/table";

class MachineRepairTable extends Component {
  render() {
    const { rows, sortColumn, onSort, user } = this.props;
    const columns = user
      ? [
          { path: "machine.name", label: "" },
          { path: "issue", label: "" },
          { path: "action", label: "" },
          { path: "shift", label: "" },
          { path: "employee.fullName", label: "" },
          { path: "createdDate", label: "" },
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
        ]
      : [
          { path: "machine.name", label: "" },
          { path: "issue", label: "" },
          { path: "action", label: "" },
          { path: "shift", label: "" },
          { path: "employee.fullName", label: "" },
          { path: "createdDate", label: "" },
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

export default MachineRepairTable;
