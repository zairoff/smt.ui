import React from "react";
import { toast } from "react-toastify";
import { getProductBrandByProductId } from "../../services/productBrandService";
import { getProducts } from "../../services/productService";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import ReadyProductExportTable from "../tables/readyProductExportTable";
import {
  exportReadyProduct,
  getReadyProductByProduct,
  getReadyProductByProductBrand,
  getReadyProducts,
} from "../../services/readyProductService";

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
  };

  async componentDidMount() {
    try {
      const { data: products } = await getProducts();

      const { data } = await getReadyProducts();

      this.setState({
        products,
        data,
        loading: false,
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
        modelId: readyProduct.modelId,
        count: readyProduct.count,
      };
      await exportReadyProduct(readyProductUpdate);
      const { data } = await getReadyProducts();
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

            const { data } = await getReadyProductByProduct(id);

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
            const { data } = await getReadyProductByProductBrand(
              prodcutBrandId
            );

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
    const { products, brands, data, sortColumn, loading } = this.state;

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
        />
      </>
    );
  }
}

export default ReadyProductExportForm;
