import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReadyProductExportTable extends Component {
  render() {
    const { rows, sortColumn, onSort, authorized, t } = this.props;

    const columns = authorized
      ? [
          { path: "model.name", label: t("tables:readyProductExportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:readyProductExportTable.columns.sapCode") },
          { path: "count", label: t("tables:readyProductExportTable.columns.count") },
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
                {t("tables:readyProductExportTable.actions.issue")}
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
                {t("tables:readyProductExportTable.actions.issueAll")}
              </button>
            ),
          },
        ]
      : [
          { path: "model.name", label: t("tables:readyProductExportTable.columns.model") },
          { path: "model.sapCode", label: t("tables:readyProductExportTable.columns.sapCode") },
          { path: "count", label: t("tables:readyProductExportTable.columns.count") },
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

export default withTranslation("tables")(ReadyProductExportTable);
