import React, { Component } from "react";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReturnedProductExportTable extends Component {
  render() {
    const { rows, sortColumn, onSort, authorized, transactionType } =
      this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: "MODEL" },
          { path: "model.sapCode", label: "SAP CODE" },
          { path: "model.barcode", label: "BAR CODE" },
          { path: "count", label: "SONI" },
          {
            path: "edit",
            content: (returnedProduct) => (
              <Link
                to={{
                  pathname: "/returned-product-export/" + returnedProduct.id,
                }}
                state={{ data: returnedProduct, transactionType }}
                className="btn btn-primary"
              >
                CHIQIM
              </Link>
            ),
          },
          {
            path: "edit-all",
            content: (returnedProduct) => (
              <button
                type="button"
                onClick={() => this.props.onDelete(returnedProduct)}
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
          { path: "model.barcode", label: "SAP CODE" },
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

export default ReturnedProductExportTable;
