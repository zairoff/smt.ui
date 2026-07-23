import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class PlanTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:planTable.columns.id") },
    { path: "line.name", label: this.props.t("tables:planTable.columns.line") },
    { path: "model.name", label: this.props.t("tables:planTable.columns.model") },
    { path: "requiredCount", label: this.props.t("tables:planTable.columns.requiredCount") },
    { path: "producedCount", label: this.props.t("tables:planTable.columns.producedCount") },
    { path: "date", label: this.props.t("tables:planTable.columns.date") },
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

export default withTranslation(["tables", "common"])(PlanTable);
