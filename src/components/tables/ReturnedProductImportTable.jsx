import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ReturnedProductImportTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized, t } = this.props;

    const columns = authorized
      ? [
          { path: "index", label: t("tables:returnedProductImportTable.columns.index") },
          { path: "model.name", label: t("tables:returnedProductImportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:returnedProductImportTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:returnedProductImportTable.columns.barCode") },
          { path: "date", label: t("tables:returnedProductImportTable.columns.receivedDate") },
          { path: "count", label: t("tables:returnedProductImportTable.columns.count") },
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
          { path: "index", label: t("tables:returnedProductImportTable.columns.index") },
          { path: "model.name", label: t("tables:returnedProductImportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:returnedProductImportTable.columns.sapCode") },
          { path: "model.barcode", label: t("tables:returnedProductImportTable.columns.barCode") },
          { path: "date", label: t("tables:returnedProductImportTable.columns.receivedDate") },
          { path: "count", label: t("tables:returnedProductImportTable.columns.count") },
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

export default withTranslation(["tables", "common"])(ReturnedProductImportTable);
