import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReadyProductTransactionsTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized, t } = this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: t("tables:readyProductTransactionsTable.columns.model") },
          { path: "model.sapCode", label: t("tables:readyProductTransactionsTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:readyProductTransactionsTable.columns.barCode") },
          { path: "date", label: t("tables:readyProductTransactionsTable.columns.receivedDate") },
          { path: "count", label: t("tables:readyProductTransactionsTable.columns.count") },
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
                {t("common:buttons.edit")}
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
                {t("common:buttons.delete")}
              </button>
            ),
          },
        ]
      : [
          { path: "model.name", label: t("tables:readyProductTransactionsTable.columns.model") },
          { path: "model.sapCode", label: t("tables:readyProductTransactionsTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:readyProductTransactionsTable.columns.barCode") },
          { path: "date", label: t("tables:readyProductTransactionsTable.columns.receivedDate") },
          { path: "count", label: t("tables:readyProductTransactionsTable.columns.count") },
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

export default withTranslation(["tables", "common"])(ReadyProductTransactionsTable);
