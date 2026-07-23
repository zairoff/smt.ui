import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class DetailedDefectTable extends Component {
  render() {
    const { rows, sortColumn, onSort, status, t } = this.props;

    const columns = status
      ? [
          { path: "line.name", label: t("tables:detailedDefectTable.columns.line") },
          { path: "barcode", label: t("tables:detailedDefectTable.columns.barcode") },
          { path: "model.name", label: t("tables:detailedDefectTable.columns.model") },
          { path: "model.sapCode", label: t("tables:detailedDefectTable.columns.sap") },
          { path: "defect.name", label: t("tables:detailedDefectTable.columns.defect") },
          { path: "action", label: t("tables:detailedDefectTable.columns.repairAction") },
          { path: "condition", label: t("tables:detailedDefectTable.columns.condition") },
          { path: "employee", label: t("tables:detailedDefectTable.columns.repairedBy") },
          { path: "createdDate", label: t("tables:detailedDefectTable.columns.loggedAt") },
          { path: "updatedDate", label: t("tables:detailedDefectTable.columns.fixedAt") },
        ]
      : [
          { path: "line.name", label: t("tables:detailedDefectTable.columns.line") },
          { path: "barcode", label: t("tables:detailedDefectTable.columns.barcode") },
          { path: "model.name", label: t("tables:detailedDefectTable.columns.model") },
          { path: "defect.name", label: t("tables:detailedDefectTable.columns.defect") },
          { path: "action", label: t("tables:detailedDefectTable.columns.repairAction") },
          { path: "condition", label: t("tables:detailedDefectTable.columns.condition") },
          { path: "employee", label: t("tables:detailedDefectTable.columns.repairedBy") },
          { path: "createdDate", label: t("tables:detailedDefectTable.columns.loggedAt") },
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

export default withTranslation("tables")(DetailedDefectTable);
