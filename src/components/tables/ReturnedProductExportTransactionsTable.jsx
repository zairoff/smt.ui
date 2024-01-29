import React, { Component } from "react";
import Table from "../common/table";

class ReturnedProductExportTransactionsTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized } = this.props;

    const columns = authorized
      ? [
          { path: "index", label: "NOMER" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "date", label: "KIRISH" },
          { path: "count", label: "SONI" },
          {
            path: "button",
            content: (returnedProduct) => (
              <button
                type="button"
                onClick={() => this.props.onDelete(returnedProduct)}
                className="btn btn-danger"
              >
                Delete
              </button>
            ),
          },
        ]
      : [
          { path: "index", label: "NOMER" },
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

export default ReturnedProductExportTransactionsTable;
