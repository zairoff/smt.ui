import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class DetailedReadyProductReportTable extends Component {
  render() {
    const { rows, sortColumn, onSort, t } = this.props;

    const columns = [
      { path: "model.name", label: t("tables:detailedReadyProductReportTable.columns.model") },
      { path: "model.sapCode", label: t("tables:detailedReadyProductReportTable.columns.sapCode") },
      { path: "count", label: t("tables:detailedReadyProductReportTable.columns.count") },
      { path: "status", label: t("tables:detailedReadyProductReportTable.columns.status") },
      { path: "date", label: t("tables:detailedReadyProductReportTable.columns.date") },
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

export default withTranslation("tables")(DetailedReadyProductReportTable);
