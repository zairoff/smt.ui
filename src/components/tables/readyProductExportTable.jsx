import React, { Component } from "react";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReadyProductExportTable extends Component {
  render() {
    const { rows, sortColumn, onSort, authorized } = this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "count", label: "SONI" },
          {
            path: "edit",
            content: (readyProduct) => (
              <Link
                to={{
                  pathname: "/ready-product-export/" + readyProduct.id,
                }}
                state={{ data: readyProduct }}
                className="btn btn-primary"
              >
                CHIQIM
              </Link>
            ),
          },
          {
            path: "edit-all",
            content: (readyProduct) => (
              <button
                type="button"
                onClick={() => this.props.onDelete(readyProduct)}
                className="btn btn-danger"
              >
                CHIQIM BARCHASINI
              </button>
            ),
          },
        ]
      : [
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
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

export default ReadyProductExportTable;
