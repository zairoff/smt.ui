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
    { path: "boardId", label: this.props.t("tables:modelTable.columns.boardId") },
    { path: "sapCode", label: this.props.t("tables:modelTable.columns.sapCode") },
    { path: "barcode", label: this.props.t("tables:modelTable.columns.barCode") },
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

export default withTranslation(["tables", "common"])(ModelTable);
