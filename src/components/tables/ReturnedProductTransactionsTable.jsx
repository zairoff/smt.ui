import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ReturnedProductTransactionsTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized, t } = this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: t("tables:returnedProductTransactionsTable.columns.model") },
          { path: "model.sapCode", label: t("tables:returnedProductTransactionsTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:returnedProductTransactionsTable.columns.barCode") },
          { path: "date", label: t("tables:returnedProductTransactionsTable.columns.receivedDate") },
          { path: "count", label: t("tables:returnedProductTransactionsTable.columns.count") },
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
          { path: "model.name", label: t("tables:returnedProductTransactionsTable.columns.model") },
          { path: "model.sapCode", label: t("tables:returnedProductTransactionsTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:returnedProductTransactionsTable.columns.barCode") },
          { path: "date", label: t("tables:returnedProductTransactionsTable.columns.receivedDate") },
          { path: "count", label: t("tables:returnedProductTransactionsTable.columns.count") },
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

export default withTranslation(["tables", "common"])(ReturnedProductTransactionsTable);
