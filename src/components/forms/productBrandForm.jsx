import _ from "lodash";
import React from "react";
import { paginate } from "../../utils/paginate";
import Pagination from "../common/pagination";
import { toast } from "react-toastify";
import ProductBrandTable from "../tables/productBrandTable";
import { getProducts } from "../../services/productService";
import { getBrands } from "../../services/brandService";
import {
  addProductBrand,
  deleteProductBrand,
  getProductBrandByProductId,
  getProductBrandByProductAndBrandId,
  getProductBrands,
} from "../../services/productBrandService";
import Form from "./form";
import ReactLoading from "react-loading";

class ProductBrandForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { products: [], brands: [] },
    currentPage: 1,
    selectedItem: { product: "", brand: "" },
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: productBrands } = await getProductBrands();
      const { data: products } = await getProducts();
      const { data: brands } = await getBrands();
      const fields = { products, brands };
      this.setState({ data: productBrands, fields });
    } catch (ex) {
      toast(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  doSubmit = async () => {
    const { data, selectedItem } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addProductBrand({
        ProductId: selectedItem.product,
        BrandId: selectedItem.brand,
      });
      const newData = [result, ...data];
      this.setState({ data: newData });
    } catch (ex) {
      toast.error(ex.response.data.message);
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
      await deleteProductBrand(id);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleSelectChange = async ({ target }) => {
    const { name, value } = target;
    const { selectedItem } = this.state;
    if (!value) return;
    // TODO: Need to find other way. Here extra server call occuring
    try {
      switch (name) {
        case "Product":
          selectedItem.product = value;
          const { data } = await getProductBrandByProductId(value);
          this.setState({ data, selectedItem });
          break;
        case "Brand":
          selectedItem.brand = value;
          this.setState({ selectedItem });
          break;
        default:
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  render() {
    const {
      data: allData,
      pageSize,
      currentPage,
      sortColumn,
      fields,
      errors,
      loading,
    } = this.state;

    const itemsCount = allData.length;
    const sortedData = _.orderBy(
      allData,
      [sortColumn.path],
      [sortColumn.order]
    );

    const data = paginate(sortedData, currentPage, pageSize);

    return (
      <form className="container m-2 row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <ProductBrandTable
            rows={data}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={itemsCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-5">
          {this.renderSelect(
            "Product",
            fields.products,
            errors.products,
            this.handleSelectChange
          )}
          <p className="mt-2"> </p>
          {this.renderSelect(
            "Brand",
            fields.brands,
            errors.brands,
            this.handleSelectChange
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
      </form>
    );
  }
}

export default ProductBrandForm;
