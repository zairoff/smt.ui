import React, { Component } from "react";
import Table from "../common/table";

class ModelTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "productBrand.product.name", label: "PRODUCT" },
    { path: "productBrand.brand.name", label: "BRAND" },
    { path: "name", label: "MODEL" },
    {
      path: "button",
      content: (productBrand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(productBrand)}
          className="btn btn-danger"
        >
          Delete
        </button>
      ),
    },
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

export default ModelTable;
