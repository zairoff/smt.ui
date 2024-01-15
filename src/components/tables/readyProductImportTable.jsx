import React, { Component } from "react";
import Table from "../common/table";

class ReadyProductImportTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized } = this.props;

    const columns = authorized
      ? [
          { path: "index", label: "NOMER" },
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "date", label: "KIRISH" },
          { path: "count", label: "SONI" },
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
        ]
      : [
          { path: "index", label: "NOMER" },
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "date", label: "KIRISH" },
          { path: "count", label: "SONI" },
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

export default ReadyProductImportTable;
