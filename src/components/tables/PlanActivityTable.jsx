import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class PlanActivityTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:planActivityTable.columns.id") },
    { path: "line.name", label: this.props.t("tables:planActivityTable.columns.line") },
    { path: "issue", label: this.props.t("tables:planActivityTable.columns.issue") },
    { path: "reason", label: this.props.t("tables:planActivityTable.columns.reason") },
    { path: "act", label: this.props.t("tables:planActivityTable.columns.correctiveAction") },
    { path: "responsible", label: this.props.t("tables:planActivityTable.columns.responsible") },
    { path: "status", label: this.props.t("tables:planActivityTable.columns.status") },
    { path: "date", label: this.props.t("tables:planActivityTable.columns.dateEntered") },
    { path: "expires", label: this.props.t("tables:planActivityTable.columns.deadline") },
    {
      path: "edit",
      content: (planActivity) => (
        <Link
          to={{
            pathname: "/plan-activity/" + planActivity.id,
          }}
          state={{ data: planActivity }}
          className="btn btn-primary"
        >
          {this.props.t("common:buttons.edit")}
        </Link>
      ),
    },
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

export default withTranslation(["tables", "common"])(PlanActivityTable);
