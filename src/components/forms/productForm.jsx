import React from "react";
import Pagination from "../common/pagination";
import ProductTable from "../tables/productTable";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import Form from "./form";
import _ from "lodash";
import {
  getProducts,
  deleteProduct,
  addProduct,
} from "../../services/productService";
import { toast } from "react-toastify";

class ProductForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { product: "" },
    currentPage: 1,
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data } = await getProducts();
      this.setState({ data });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePaginationChange = (page) => {
    this.setState({ currentPage: page });
  };

  doSubmit = async () => {
    const { data, fields } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addProduct({ name: fields.product });
      const newData = [result, ...data];
      this.setState({ data: newData, fields: { product: "" } });
    } catch (ex) {
      this.catchExceptionMessage(ex, "product");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deleteProduct(id);
    } catch (ex) {
      this.setState({ data: clone });
      this.catchExceptionMessage(ex, "product");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  render() {
    const {
      data: allRows,
      pageSize,
      currentPage,
      sortColumn,
      fields,
      errors,
      loading,
    } = this.state;

    const sortedRows = _.orderBy(
      allRows,
      [sortColumn.path],
      [sortColumn.order]
    );
    const rows = paginate(sortedRows, currentPage, pageSize);
    return (
      <form className="container m-2 row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <ProductTable
            rows={rows}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
          <Pagination
            itemsCount={allRows.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePaginationChange}
          />
        </div>
        <div className="col m-5">
          {this.renderInput(
            "product",
            "",
            "",
            fields.product,
            this.handleInputChange,
            errors.product,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
      </form>
    );
  }
}

export default ProductForm;
