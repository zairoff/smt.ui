import React, { Component } from "react";
import Table from "../common/table";

class PlanActivityReportTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "line.name", label: "LINE" },
    { path: "date", label: "KIRITILGAN SANA" },
    { path: "issue", label: "NOMUVOFIQLIK" },
    { path: "reason", label: "SABAB" },
    { path: "act", label: "TO'G'IRLASH ISHLARI" },
    { path: "expires", label: "MUDDAT" },
    { path: "responsible", label: "JAVOBGARLAR" },
    { path: "status", label: "STATUS" },
  ];
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

export default PlanActivityReportTable;
