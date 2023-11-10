import React, { Component } from "react";
import Table from "../common/table";

class ReadyProductExportTable extends Component {
  columns = [
    { path: "model.name", label: "MODEL" },
    { path: "model.sapCode", label: "SAP CODE" },
    { path: "count", label: "SONI" },
    { path: "exit", label: "CHIQISH" },
    {
      path: "button",
      content: (readyProduct) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(readyProduct)}
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

export default ReadyProductExportTable;
