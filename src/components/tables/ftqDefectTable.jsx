import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class FtqDefectTable extends Component {
  render() {
    const { rows, sortColumn, onSort, fields, line, t } = this.props;

    const columns = [
      { path: "name", label: t("tables:ftqDefectTable.columns.name") },
      { path: "count", label: t("tables:ftqDefectTable.columns.count") },
      {
        path: "details",
        content: (defect) => (
          <Link
            to={{
              pathname: "/detailed",
            }}
            state={{
              data: {
                from: fields.from,
                to: fields.to,
                line: line,
                status: true,
                display: "defect",
                defectName: defect.name,
              },
            }}
            className="btn btn-primary"
          >
            {t("tables:ftqDefectTable.actions.details")}
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

export default withTranslation("tables")(FtqDefectTable);
