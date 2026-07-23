import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class HourlyPlanTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:hourlyPlanTable.columns.id") },
    { path: "line.name", label: this.props.t("tables:hourlyPlanTable.columns.line") },
    { path: "model.name", label: this.props.t("tables:hourlyPlanTable.columns.model") },
    { path: "plan", label: this.props.t("tables:hourlyPlanTable.columns.plan") },
    { path: "produced", label: this.props.t("tables:hourlyPlanTable.columns.produced") },
    { path: "time", label: this.props.t("tables:hourlyPlanTable.columns.date") },
    {
      path: "button",
      content: (productBrand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(productBrand)}
          className="btn btn-danger"
        >
          {this.props.t("common:buttons.delete")}
        </button>
      ),
    },
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

export default withTranslation(["tables", "common"])(HourlyPlanTable);
