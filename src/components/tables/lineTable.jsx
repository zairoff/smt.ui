import React, { Component } from "react";
import Table from "../common/table";

class LineTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "name", label: "LINE" },
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

export default LineTable;
