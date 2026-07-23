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
class BoardReportTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort, t } = this.props;

    const columns = [
      { path: "qrCode", label: t("tables:boardReportTable.columns.qrCode") },
      { path: "qrReader.name", label: t("tables:boardReportTable.columns.reader") },
      { path: "model.name", label: t("tables:boardReportTable.columns.model") },
      { path: "model.sapCode", label: t("tables:boardReportTable.columns.sapCode") },
      { path: "dateTime", label: t("tables:boardReportTable.columns.time") },
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

export default withTranslation(["tables", "common"])(BoardReportTable);
