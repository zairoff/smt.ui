import React, { Component } from "react";
import Table from "../common/table";

class LineDefectTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "line.name", label: "LINE" },
    { path: "defect.name", label: "DEFECT" },
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

export default LineDefectTable;
