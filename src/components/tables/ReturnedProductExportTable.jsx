import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReturnedProductExportTable extends Component {
  render() {
    const { rows, sortColumn, onSort, authorized, transactionType, t } =
      this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: t("tables:returnedProductExportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:returnedProductExportTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:returnedProductExportTable.columns.barCode") },
          { path: "count", label: t("tables:returnedProductExportTable.columns.count") },
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
                {t("tables:returnedProductExportTable.actions.issue")}
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
                {t("tables:returnedProductExportTable.actions.issueAll")}
              </button>
            ),
          },
        ]
      : [
          { path: "model.name", label: t("tables:returnedProductExportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:returnedProductExportTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:returnedProductExportTable.columns.sapCode") },
          { path: "count", label: t("tables:returnedProductExportTable.columns.count") },
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

export default withTranslation(["tables", "common"])(ReturnedProductExportTable);
