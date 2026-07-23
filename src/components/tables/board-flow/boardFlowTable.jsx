import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../../common/table";

/*
    public enum BoardPassStatus
    {
        Passed = 0,
        MissingPreviousPass = 1,
        Deleted = 2,
    }
*/
class BoardFlowTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, t } = this.props;

    const columns = [
      { path: "qrCode", label: t("tables:boardFlowTable.columns.qrCode") },
      { path: "qrReader.name", label: t("tables:boardFlowTable.columns.reader") },
      { path: "model.name", label: t("tables:boardFlowTable.columns.model") },
      { path: "model.sapCode", label: t("tables:boardFlowTable.columns.sapCode") },
      { path: "dateTime", label: t("tables:boardFlowTable.columns.time") },
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

export default withTranslation("tables")(BoardFlowTable);
