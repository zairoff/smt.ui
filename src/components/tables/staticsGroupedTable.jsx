import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class StaticsGroupedTable extends Component {
  get columns() {
    return [
    { path: "name", label: this.props.t("tables:staticsGroupedTable.columns.name") },
    { path: "count", label: this.props.t("tables:staticsGroupedTable.columns.count") },
  ];
  }
  render() {
    const { rows, sortColumn, onSort } = this.props;
    return (
      <Table
        columns={this.columns}
        rows={rows}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default withTranslation("tables")(StaticsGroupedTable);
