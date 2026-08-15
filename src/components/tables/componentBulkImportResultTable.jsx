import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import Table from "../common/table";

const STATUS_BADGE = {
  Created: "badge bg-success",
  Updated: "badge bg-info text-dark",
  Failed: "badge bg-danger",
};

class ComponentBulkImportResultTable extends Component {
  state = {
    sortColumn: { path: "row", order: "asc" },
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  get columns() {
    const { t } = this.props;

    return [
      { path: "row", label: t("tables:componentBulkImportResultTable.columns.row") },
      { path: "partNumber", label: t("tables:componentBulkImportResultTable.columns.partNumber") },
      { path: "rCode", label: t("tables:componentBulkImportResultTable.columns.rCode") },
      {
        path: "status",
        label: t("tables:componentBulkImportResultTable.columns.status"),
        content: (result) => (
          <span className={STATUS_BADGE[result.status] || "badge bg-secondary"}>
            {t(`tables:componentBulkImportResultTable.status.${result.status}`, result.status)}
          </span>
        ),
      },
      { path: "message", label: t("tables:componentBulkImportResultTable.columns.message") },
    ];
  }

  render() {
    const { rows, loading } = this.props;
    const { sortColumn } = this.state;
    const sortedRows = _.orderBy(rows, [sortColumn.path], [sortColumn.order]);

    return (
      <Table
        columns={this.columns}
        rows={sortedRows}
        sortColumn={sortColumn}
        onSort={this.handleSort}
        loading={loading}
        emptyMessage={this.props.t("tables:componentBulkImportResultTable.empty")}
      />
    );
  }
}

export default withTranslation(["tables", "common"])(ComponentBulkImportResultTable);
