import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class DefectTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:defectTable.columns.id") },
    { path: "name", label: this.props.t("tables:defectTable.columns.name") },
    {
      path: "isActive",
      label: this.props.t("tables:defectTable.columns.status"),
      content: (defect) => (
        <span className={"badge " + (defect.isActive ? "bg-success" : "bg-secondary")}>
          {this.props.t(defect.isActive ? "common:status.active" : "common:status.disabled")}
        </span>
      ),
    },
    {
      path: "button",
      content: (defect) => (
        <button
          type="button"
          onClick={() => this.props.onToggleStatus(defect)}
          className={defect.isActive ? "btn btn-outline-danger" : "btn btn-success"}
        >
          {this.props.t(defect.isActive ? "common:buttons.disable" : "common:buttons.enable")}
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

export default withTranslation(["tables", "common"])(DefectTable);
