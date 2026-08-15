import React from "react";
import ReactLoading from "react-loading";
import Form from "./form";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import config from "../../config.json";
import { getLines } from "../../services/lineService";
import { getProducts } from "../../services/productService";
import { getProductBrandByProductId } from "../../services/productBrandService";
import { getModelByProductBrandId } from "../../services/modelService";
import { getInstructionPositionsByLine } from "../../services/instructionPositionService";
import {
  addOrUpdateInstructionImage,
  deleteInstructionImage,
  getInstructionImagesByModel,
} from "../../services/modelInstructionImageService";
import { addFile } from "../../services/fileService";

class ModelInstructionForm extends Form {
  inputFile = React.createRef();
  activePositionId = null;

  state = {
    products: [],
    productBrands: [],
    brands: [],
    models: [],
    lines: [],
    positions: [],
    images: [],
    selectedItem: { lineId: "", productId: "", brandId: "", modelId: "" },
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

  loadGrid = async (lineId, modelId) => {
    if (!lineId || !modelId) return;

    this.setState({ loading: true });
    try {
      const [{ data: positions }, { data: images }] = await Promise.all([
        getInstructionPositionsByLine(lineId),
        getInstructionImagesByModel(modelId),
      ]);
      this.setState({ positions, images });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;
    this.setState({ loading: true });
    try {
      switch (name) {
        case "Line":
          {
            const { selectedItem } = this.state;
            selectedItem.lineId = id;
            this.setState({ selectedItem, positions: [], loading: false });
            await this.loadGrid(id, selectedItem.modelId);
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
              positions: [],
              images: [],
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
              positions: [],
              images: [],
              loading: false,
            });
          }
          break;
        case "Model":
          {
            const { selectedItem } = this.state;
            selectedItem.modelId = id;

            this.setState({ selectedItem, loading: false });
            await this.loadGrid(selectedItem.lineId, id);
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  handleImageClick = (positionId) => {
    this.activePositionId = positionId;
    this.inputFile.current.click();
  };

  handleImageRemove = async (image) => {
    const { images } = this.state;

    this.setState({ loading: true });
    try {
      await deleteInstructionImage(image.id);
      this.setState({
        images: images.filter((i) => i.id !== image.id),
      });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data.message : ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleFileUpload = async (e) => {
    const { files } = e.target;
    const positionId = this.activePositionId;

    if (!files || !files.length || !positionId) return;

    const { selectedItem, images } = this.state;

    try {
      this.setState({ loading: true });
      const formData = new FormData();
      formData.append("file", files[0]);
      const { data: fileName } = await addFile(formData);

      const { data: updated } = await addOrUpdateInstructionImage({
        modelId: selectedItem.modelId,
        instructionPositionId: positionId,
        imagePath: fileName,
      });

      const newImages = [
        ...images.filter((i) => i.instructionPositionId !== positionId),
        updated,
      ];
      this.setState({ images: newImages });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data.message : ex.message);
    } finally {
      this.setState({ loading: false });
      e.target.value = "";
    }
  };

  render() {
    const { t } = this.props;
    const {
      products,
      brands,
      models,
      lines,
      positions,
      images,
      selectedItem,
      loading,
    } = this.state;

    return (
      <div className="m-2">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <input
          style={{ display: "none" }}
          ref={this.inputFile}
          onChange={this.handleFileUpload}
          type="file"
        />
        <div className="row">
          <div className="col-3">
            {this.renderSelect(
              "Line",
              lines,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("pcbaInstruction:modelInstruction.lineLabel")
            )}
          </div>
          <div className="col-3">
            {this.renderSelect(
              "Product",
              products,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("pcbaInstruction:modelInstruction.productLabel")
            )}
          </div>
          <div className="col-3">
            {this.renderSelect(
              "Brand",
              brands,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("pcbaInstruction:modelInstruction.brandLabel")
            )}
          </div>
          <div className="col-3">
            {this.renderSelect(
              "Model",
              models,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("pcbaInstruction:modelInstruction.modelLabel")
            )}
          </div>
        </div>

        <p className="mt-3"> </p>

        {(!selectedItem.lineId || !selectedItem.modelId) && (
          <div className="alert alert-secondary">
            {t("pcbaInstruction:modelInstruction.selectPrompt")}
          </div>
        )}

        {selectedItem.lineId &&
          selectedItem.modelId &&
          positions.length === 0 &&
          !loading && (
            <div className="alert alert-warning">
              {t("pcbaInstruction:modelInstruction.noPositionsForLine")}
            </div>
          )}

        <div className="row">
          {positions.map((p) => {
            const image = images.find(
              (i) => i.instructionPositionId === p.id
            );
            return (
              <div className="col-3 mb-4 text-center" key={p.id}>
                <div className="fw-bold mb-1">{p.name}</div>
                <img
                  src={
                    image
                      ? config.fileUrl + image.imagePath
                      : require("../../assets/images/staff.jpg")
                  }
                  style={{
                    height: "160px",
                    width: "160px",
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "1px solid #ccc",
                  }}
                  onClick={() => this.handleImageClick(p.id)}
                />
                <div className="text-muted small mt-1">
                  {t("pcbaInstruction:modelInstruction.replaceLabel")}
                </div>
                {image && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-1"
                    onClick={() => this.handleImageRemove(image)}
                  >
                    {t("pcbaInstruction:modelInstruction.removeLabel")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withTranslation(["pcbaInstruction", "common"])(
  ModelInstructionForm
);
