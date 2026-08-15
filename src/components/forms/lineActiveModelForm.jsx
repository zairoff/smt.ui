import React from "react";
import ReactLoading from "react-loading";
import Form from "./form";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getLines } from "../../services/lineService";
import { getProducts } from "../../services/productService";
import { getProductBrandByProductId } from "../../services/productBrandService";
import { getModelByProductBrandId } from "../../services/modelService";
import {
  getActiveModelByLine,
  setActiveModel,
} from "../../services/lineActiveModelService";

class LineActiveModelForm extends Form {
  state = {
    fields: {},
    products: [],
    productBrands: [],
    brands: [],
    models: [],
    lines: [],
    selectedItem: { lineId: "", productId: "", brandId: "", modelId: "" },
    currentActiveModel: null,
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const [{ data: lines }, { data: products }] = await Promise.all([
        getLines(),
        getProducts(),
      ]);
      this.setState({ lines, products });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;
    this.setState({ loading: true });
    try {
      switch (name) {
        case "Line":
          {
            const { selectedItem } = this.state;
            selectedItem.lineId = id;
            selectedItem.modelId = "";

            let currentActiveModel = null;
            if (id) {
              const { data } = await getActiveModelByLine(id);
              currentActiveModel = data;
            }

            this.setState({
              selectedItem,
              currentActiveModel,
              loading: false,
            });
          }
          break;
        case "Product":
          {
            const { selectedItem } = this.state;
            const { data: productBrands } = await getProductBrandByProductId(
              id
            );
            const brands = productBrands.map((p) => p.brand);
            selectedItem.productId = id;
            selectedItem.brandId = "";
            selectedItem.modelId = "";
            this.setState({
              brands,
              productBrands,
              selectedItem,
              models: [],
              loading: false,
            });
          }
          break;
        case "Brand":
          {
            const { productBrands, selectedItem } = this.state;
            const productBrand = productBrands.filter(
              (pb) =>
                pb.product.id == selectedItem.productId && pb.brand.id == id
            );

            const { data: models } = await getModelByProductBrandId(
              productBrand[0].id
            );

            selectedItem.brandId = id;
            selectedItem.modelId = "";

            this.setState({
              selectedItem,
              models,
              loading: false,
            });
          }
          break;
        case "Model":
          {
            const { selectedItem } = this.state;
            selectedItem.modelId = id;

            this.setState({ selectedItem, loading: false });
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  doSubmit = async () => {
    const { t } = this.props;
    const { selectedItem } = this.state;

    if (!selectedItem.lineId) {
      this.setState({
        errors: {
          ...this.state.errors,
          lineId: t("pcbaInstruction:lineActiveModel.lineRequired"),
        },
      });
      return;
    }
    if (!selectedItem.modelId) {
      this.setState({
        errors: {
          ...this.state.errors,
          modelId: t("pcbaInstruction:lineActiveModel.modelRequired"),
        },
      });
      return;
    }

    this.setState({ loading: true, errors: {} });
    try {
      const { data } = await setActiveModel({
        lineId: selectedItem.lineId,
        modelId: selectedItem.modelId,
      });
      this.setState({ currentActiveModel: data });
      toast.info(t("pcbaInstruction:lineActiveModel.successMessage"));
    } catch (ex) {
      toast.error(ex.response ? ex.response.data.message : ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { t } = this.props;
    const {
      products,
      brands,
      models,
      lines,
      selectedItem,
      currentActiveModel,
      errors,
      loading,
    } = this.state;

    return (
      <form className="row m-2" onSubmit={this.handleSubmit}>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col-6">
          <h5>{t("pcbaInstruction:lineActiveModel.title")}</h5>
          {this.renderSelect(
            "Line",
            lines,
            errors.lineId,
            this.handleSelectChange,
            "id",
            "name",
            t("pcbaInstruction:lineActiveModel.lineLabel")
          )}
          <p className="mt-2"> </p>

          {currentActiveModel && (
            <div className="alert alert-info">
              {t("pcbaInstruction:lineActiveModel.currentTitle")}:{" "}
              <strong>{currentActiveModel.modelName}</strong>
            </div>
          )}
          {selectedItem.lineId && !currentActiveModel && (
            <div className="alert alert-secondary">
              {t("pcbaInstruction:lineActiveModel.noneSet")}
            </div>
          )}

          {this.renderSelect(
            "Product",
            products,
            "",
            this.handleSelectChange,
            "id",
            "name",
            t("pcbaInstruction:lineActiveModel.productLabel")
          )}
          <p className="mt-2"> </p>
          {this.renderSelect(
            "Brand",
            brands,
            "",
            this.handleSelectChange,
            "id",
            "name",
            t("pcbaInstruction:lineActiveModel.brandLabel")
          )}
          <p className="mt-2"> </p>
          {this.renderSelect(
            "Model",
            models,
            errors.modelId,
            this.handleSelectChange,
            "id",
            "name",
            t("pcbaInstruction:lineActiveModel.modelLabel")
          )}
          <p className="mt-2"> </p>
          {this.renderButton(t("pcbaInstruction:lineActiveModel.setButton"))}
        </div>
      </form>
    );
  }
}

export default withTranslation(["pcbaInstruction", "common"])(
  LineActiveModelForm
);
