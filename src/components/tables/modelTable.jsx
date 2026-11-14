import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ModelTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:modelTable.columns.id") },
    { path: "productBrand.product.name", label: this.props.t("tables:modelTable.columns.product") },
    { path: "productBrand.brand.name", label: this.props.t("tables:modelTable.columns.brand") },
    { path: "name", label: this.props.t("tables:modelTable.columns.model") },
    { path: "sapCode", label: this.props.t("tables:modelTable.columns.sapCode") },
    { path: "barcode", label: this.props.t("tables:modelTable.columns.barCode") },
    {
      path: "isActive",
      label: this.props.t("tables:modelTable.columns.status"),
      content: (model) => (
        <span className={"badge " + (model.isActive ? "bg-success" : "bg-secondary")}>
          {this.props.t(model.isActive ? "common:status.active" : "common:status.disabled")}
        </span>
      ),
    },
    {
      path: "edit",
      content: (model) => (
        <Link
          to={{
            pathname: "/model-edit/" + model.id,
          }}
          state={{ data: model }}
          className="btn btn-primary"
        >
          {this.props.t("common:buttons.edit")}
        </Link>
      ),
    },
    {
      path: "button",
      content: (model) => (
        <button
          type="button"
          onClick={() => this.props.onToggleStatus(model)}
          className={model.isActive ? "btn btn-outline-danger" : "btn btn-success"}
        >
          {this.props.t(model.isActive ? "common:buttons.disable" : "common:buttons.enable")}
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

export default withTranslation(["tables", "common"])(ModelTable);
