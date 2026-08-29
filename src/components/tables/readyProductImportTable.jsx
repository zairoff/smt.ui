import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ReadyProductImportTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, authorized, t } = this.props;

    const columns = authorized
      ? [
          { path: "index", label: t("tables:readyProductImportTable.columns.index") },
          { path: "model.name", label: t("tables:readyProductImportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:readyProductImportTable.columns.sapCode") },
          { path: "date", label: t("tables:readyProductImportTable.columns.receivedDate") },
          { path: "count", label: t("tables:readyProductImportTable.columns.count") },
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
          { path: "index", label: t("tables:readyProductImportTable.columns.index") },
          { path: "model.name", label: t("tables:readyProductImportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:readyProductImportTable.columns.sapCode") },
          { path: "date", label: t("tables:readyProductImportTable.columns.receivedDate") },
          { path: "count", label: t("tables:readyProductImportTable.columns.count") },
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

export default withTranslation(["tables", "common"])(ReadyProductImportTable);
