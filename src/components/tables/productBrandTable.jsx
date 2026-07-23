import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class ProductBrandTable extends Component {
  get columns() {
    return [
    { path: "id", label: this.props.t("tables:productBrandTable.columns.id") },
    { path: "product.name", label: this.props.t("tables:productBrandTable.columns.product") },
    { path: "brand.name", label: this.props.t("tables:productBrandTable.columns.brand") },
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

export default withTranslation(["tables", "common"])(ProductBrandTable);
