import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReadyProductGroupByTable extends Component {
  render() {
    const { rows, sortColumn, fields, onSort, transactionType, t } =
      this.props;

    const columns = [
      { path: "model", label: t("tables:readyProductGroupByTable.columns.model") },
      { path: "sapCode", label: t("tables:readyProductGroupByTable.columns.sapCode") },
      { path: "count", label: t("tables:readyProductGroupByTable.columns.count") },
      {
        path: "details",
        content: (readyproduct) => (
          <Link
            to={{
              pathname: "/ready-product-detailed",
            }}
            state={{
              data: {
                from: fields.from,
                to: fields.to,
                sapCode: readyproduct.sapCode,
                transactionType: transactionType,
              },
            }}
            className="btn btn-primary"
          >
            {t("tables:readyProductGroupByTable.actions.details")}
          </Link>
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

export default withTranslation("tables")(ReadyProductGroupByTable);
