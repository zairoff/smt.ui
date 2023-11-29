import React from "react";
import { toast } from "react-toastify";
import { getProductBrandByProductId } from "../../services/productBrandService";
import { getProducts } from "../../services/productService";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import ReadyProductExportTable from "../tables/readyProductExportTable";
import {
  exportReadyProductTransaction,
  getReadyProductTransactions,
  getTransactionByProduct,
  getTransactionByProductBrand,
} from "../../services/readyProductTransactionService";

class ReadyProductExportForm extends Form {
  state = {
    products: [],
    productBrands: [],
    brands: [],
    errors: {},
    data: [],
    loading: true,
    sortColumn: { path: "", order: "asc" },
    selectedProduct: "",
    selectedBrand: "",
    authorized: false,
  };

  async componentDidMount() {
    const { authorized } = this.props;
    try {
      const { data: products } = await getProducts();

      const { data } = await getReadyProductTransactions();

      this.setState({
        products,
        data,
        loading: false,
        authorized,
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleDelete = async (readyProduct) => {
    try {
      this.setState({ loading: true });
      const readyProductUpdate = {
        modelId: readyProduct.model.id,
        count: readyProduct.count,
      };
      await exportReadyProductTransaction(readyProductUpdate);
      const { data } = await getReadyProductTransactions();
      this.setState({ loading: false, data });
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.title);
    }
  };

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;

    this.setState({ loading: true });
    try {
      switch (name) {
        case "Product":
          {
            const { data: productBrands } = await getProductBrandByProductId(
              id
            );
            const brands = productBrands.map((p) => p.brand);

            const { data } = await getTransactionByProduct(id);

            this.setState({
              brands,
              data,
              productBrands,
              selectedProduct: id,
              loading: false,
            });
          }
          break;
        case "Brand":
          {
            const { productBrands, selectedProduct } = this.state;
            const productBrand = productBrands.filter(
              (pb) => pb.product.id == selectedProduct && pb.brand.id == id
            );

            const prodcutBrandId =
              productBrand.length > 0 ? productBrand[0].id : 0;
            const { data } = await getTransactionByProductBrand(prodcutBrandId);

            this.setState({
              selectedBrand: id,
              data,
              loading: false,
              reports: [],
            });
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  render() {
    const { products, brands, data, sortColumn, loading, authorized } =
      this.state;

    return (
      <>
        <div className="row mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="col">
            {this.renderSelect(
              "Product",
              products,
              "",
              this.handleSelectChange
            )}
          </div>
          <div className="col">
            {this.renderSelect("Brand", brands, "", this.handleSelectChange)}
          </div>
        </div>
        <ReadyProductExportTable
          rows={data}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
          authorized={authorized}
        />
      </>
    );
  }
}

export default ReadyProductExportForm;
