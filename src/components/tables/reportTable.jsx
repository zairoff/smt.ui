import React, { Component } from "react";
import Table from "../common/table";

class ReportTable extends Component {
  columns = [
    { path: "barcode", label: "BARCODE" },
    { path: "model.name", label: "MODEL" },
    { path: "defect.name", label: "DEFECT" },
    {
      path: "button",
      content: (report) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(report)}
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

export default ReportTable;
