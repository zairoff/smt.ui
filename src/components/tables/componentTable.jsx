import React, { Component } from "react";
import Table from "../common/table";

class ComponentTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "partNumber", label: "PARTNUMBER" },
    { path: "rCode", label: "RCODE" },
    { path: "storePlaceNumber", label: "STOREPLACE" },
    { path: "sapPlace", label: "SAPPLACE" },
    {
      path: "button",
      content: (component) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(component)}
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

export default ComponentTable;
