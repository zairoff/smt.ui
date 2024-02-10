import React, { Component } from "react";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReadyProductTransactionsTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized } = this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "model.barcode", label: "BAR CODE" },
          { path: "date", label: "KIRISH" },
          { path: "count", label: "SONI" },
          {
            path: "edit",
            content: (readyProduct) => (
              <Link
                to={{
                  pathname: "/ready-product-transactions/" + readyProduct.id,
                }}
                state={{ data: readyProduct }}
                className="btn btn-primary"
              >
                O'ZGARTIRISH
              </Link>
            ),
          },
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
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "model.barcode", label: "BAR CODE" },
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

export default ReadyProductTransactionsTable;
