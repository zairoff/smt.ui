import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ReturnProductGroupByTable extends Component {
  render() {
    const { rows, sortColumn, onSort, t } = this.props;

    const columns = [
      { path: "model", label: t("tables:returnProductGroupByTable.columns.model") },
      { path: "sapCode", label: t("tables:returnProductGroupByTable.columns.sapCode") },
      { path: "barCode", label: t("tables:returnProductGroupByTable.columns.barCode") },
      { path: "count", label: t("tables:returnProductGroupByTable.columns.count") },
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

export default withTranslation("tables")(ReturnProductGroupByTable);
