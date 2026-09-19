import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ScannedBoardsTable extends Component {
  render() {
    const { rows, onRemove, t } = this.props;

    const columns = [
      { path: "modelName", label: t("tables:scannedBoardsTable.columns.model") },
      { path: "sapCode", label: t("tables:scannedBoardsTable.columns.sapCode") },
      { path: "serialCode", label: t("tables:scannedBoardsTable.columns.serialCode") },
      { path: "barcode", label: t("tables:scannedBoardsTable.columns.barCode") },
      { path: "count", label: t("tables:scannedBoardsTable.columns.count") },
      {
        path: "status",
        label: t("tables:scannedBoardsTable.columns.status"),
        content: (row) =>
          row.missing ? (
            <span className="badge bg-warning text-dark">
              {t("tables:scannedBoardsTable.missingBadge")}
            </span>
          ) : (
            <span className="badge bg-success">
              {t("tables:scannedBoardsTable.okBadge")}
            </span>
          ),
      },
      {
        path: "remove",
        content: (row) => (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onRemove(row.id)}
          >
            {t("tables:scannedBoardsTable.remove")}
          </button>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        rows={rows}
        emptyMessage={t("tables:scannedBoardsTable.empty")}
      />
    );
  }
}

export default withTranslation(["tables", "common"])(ScannedBoardsTable);
