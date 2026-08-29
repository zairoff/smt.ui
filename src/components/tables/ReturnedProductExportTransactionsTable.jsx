import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ReturnedProductExportTransactionsTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, t } = this.props;

    const columns = [
      { path: "index", label: t("tables:returnedProductExportTransactionsTable.columns.index") },
      { path: "model.sapCode", label: t("tables:returnedProductExportTransactionsTable.columns.sapCode") },
      { path: "date", label: t("tables:returnedProductExportTransactionsTable.columns.receivedDate") },
      { path: "count", label: t("tables:returnedProductExportTransactionsTable.columns.count") },
      {
        path: "button",
        content: (returnedProduct) => (
          <button
            type="button"
            onClick={() => this.props.onDelete(returnedProduct)}
            className="btn btn-danger"
          >
            {t("common:buttons.delete")}
          </button>
        ),
      },
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

export default withTranslation(["tables", "common"])(
  ReturnedProductExportTransactionsTable
);
