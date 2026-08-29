import React from "react";
import { withTranslation } from "react-i18next";
import { getLines } from "../../services/lineService";
import { getModelByProductBrandId } from "../../services/modelService";
import { getProducts } from "../../services/productService";
import Form from "../forms/form";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import ButtonBadge from "../common/buttonBadge";
import { getProductBrandByProductId } from "../../services/productBrandService";
import { getLineDefectByLineId } from "../../services/lineDefectService";
import {
  addReport,
  deleteReport,
  getReportByModelIdAndLineId,
  updateReport,
} from "../../services/reportService";
import ReportTable from "../tables/reportTable";
import Pagination from "../common/pagination";
import _ from "lodash";
import { paginate } from "../../utils/paginate";
import { format } from "date-fns";

class Report extends Form {
  barcodeRef = React.createRef();
  submitting = false;

  state = {
    fields: {
      barcode: "",
    },
    products: [],
    productBrands: [],
    brands: [],
    models: [],
    lines: [],
    defects: [],
    selectedItem: { productId: "", brandId: "", modelId: "", lineId: "" },
    selectedModel: null,
    data: [],
    errors: {},
    loading: true,
    isActiveBarcode: false,
    isSubmitting: false,
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 25,
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  async componentDidMount() {
    try {
      const { data: products } = await getProducts();
      const { data: lines } = await getLines();
      this.setState({ products, lines });
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
        case "Product":
          {
            const { data: productBrands } = await getProductBrandByProductId(
              id
            );
            const brands = productBrands.map((p) => p.brand);
            this.setState({
              fields: { barcode: "" },
              errors: {},
              brands,
              productBrands,
              selectedItem: {
                productId: id,
                brandId: "",
                modelId: "",
                lineId: "",
              },
              selectedModel: null,
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
            selectedItem.modelId = null;
            selectedItem.lineId = null;

            this.setState({
              fields: { barcode: "" },
              errors: {},
              selectedItem,
              selectedModel: null,
              models,
              loading: false,
            });
          }
          break;
        case "Model":
          const { selectedItem } = this.state;

          selectedItem.modelId = id;
          selectedItem.lineId = null;

          const selectedModel = this.state.models.find((m) => m.id == id);

          this.setState({
            selectedItem,
            selectedModel,
            fields: { barcode: "" },
            errors: {},
            loading: false,
          });
          break;
        case "Line":
          {
            const { selectedItem } = this.state;
            selectedItem.lineId = id;

            if (!selectedItem.modelId) return;

            const { data: lineDefects } = await getLineDefectByLineId(id);
            const defects = lineDefects.map((ld) => ld.defect);

            const { data } = await getReportByModelIdAndLineId(
              selectedItem.modelId,
              selectedItem.lineId,
              format(new Date(), "yyyy-MM-dd HH:mm:ss"),
              false
            );
            this.setState({
              defects,
              selectedItem,
              data,
              fields: { barcode: "" },
              loading: false,
            });
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  isDuplicatedBarcode(value) {
    const trimmed = value.trim();
    const { length } = trimmed;
    if (length === 0 || length % 2 !== 0) return false;

    const half = length / 2;
    return trimmed.slice(0, half) === trimmed.slice(half);
  }

  getBarcodeError(value) {
    const { selectedModel } = this.state;

    if (!value) return null;

    if (this.isDuplicatedBarcode(value)) {
      return this.props.t("report.doubleScanWarning");
    }

    if (selectedModel && selectedModel.barcode) {
      const prefix = selectedModel.barcode.trim().toUpperCase();
      if (!value.trim().toUpperCase().startsWith(prefix)) {
        return this.props.t("report.barcodeMismatchWarning", { prefix });
      }
    }

    return null;
  }

  handleCustomInputChange = async ({ currentTarget: input }) => {
    const { value } = input;

    const errors = { ...this.state.errors };
    const error = this.getBarcodeError(value);
    if (error) errors[input.id] = error;
    else delete errors[input.id];

    const fields = { ...this.state.fields };
    fields[input.id] = value;
    this.setState({ fields, errors, isActiveBarcode: false });
  };

  handleButtonClick = async (defect) => {
    const { fields, selectedItem, data } = this.state;
    const { modelId, lineId } = selectedItem;

    if (
      Object.values(fields).every((x) => x === null || x === "") ||
      Object.values(selectedItem).every((x) => x === null || x === "")
    ) {
      toast.warning(this.props.t("report.selectModelWarning"));
      return;
    }

    const barcodeError = this.getBarcodeError(fields.barcode);
    if (barcodeError) {
      toast.warning(barcodeError);
      this.setState({ errors: { ...this.state.errors, barcode: barcodeError } });
      return;
    }

    if (this.submitting) return;

    const barcode = fields.barcode.trim();

    if (data.some((d) => d.barcode === barcode)) {
      toast.warning(this.props.t("report.duplicateBarcodeWarning"));
      this.setState({ isActiveBarcode: true });
      return;
    }

    this.submitting = true;
    this.setState({ isSubmitting: true });

    const report = {
      barcode,
      lineId: lineId,
      defectId: defect,
      modelId: modelId,
    };

    try {
      await addReport(report);
      const { data } = await getReportByModelIdAndLineId(
        modelId,
        lineId,
        format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        false
      );
      this.setState({ data, isActiveBarcode: false, fields: { barcode: "" } });
    } catch (ex) {
      this.catchExceptionMessage(ex, "barcode");

      if (ex.response && ex.response.status == 409) {
        this.setState({ data, isActiveBarcode: true });
      } else {
        this.setState({
          data,
          isActiveBarcode: false,
          fields: { barcode: "" },
        });
      }
    } finally {
      this.submitting = false;
      this.setState({ isSubmitting: false });
    }
  };

  handleButtonClear = () => {
    const errors = { ...this.state.errors };
    delete errors.barcode;
    this.setState({ fields: { barcode: "" }, errors });
  };

  handleButtonRemont = async () => {
    const { fields, data } = this.state;

    const filteredData = data.filter((d) => d.barcode == fields.barcode);

    const line = _.get(filteredData[0], "line.name");

    const reportId = _.get(filteredData[0], "id");

    try {
      await updateReport(reportId, {
        status: true,
        employee: line,
        condition: "Ishladi",
        action: "To`g`irlandi",
      });

      const filteredData = data.filter((d) => d.barcode != fields.barcode);

      this.setState({
        data: filteredData,
        fields: { barcode: "" },
        isActiveBarcode: false,
        errors: "",
      });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleDelete = async (report) => {
    const clone = [...this.state.data];
    const filtered = clone.filter((r) => r.id != report.id);
    this.setState({ data: filtered });
    try {
      await deleteReport(report.id);
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ data: clone });
    }
  };

  render() {
    const {
      fields,
      products,
      brands,
      models,
      defects,
      lines,
      errors,
      data,
      sortColumn,
      currentPage,
      pageSize,
      loading,
      isActiveBarcode,
      isSubmitting,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);
    const { t } = this.props;

    return (
      <React.Fragment>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="row mt-4">
          <div className="col">
            {this.renderSelect(
              "Product",
              products,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("report.product")
            )}
          </div>
          <div className="col">
            {this.renderSelect(
              "Brand",
              brands,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("report.brand")
            )}
          </div>
          <div className="col">
            {this.renderSelect(
              "Model",
              models,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("report.model")
            )}
          </div>
          <div className="col">
            {this.renderSelect(
              "Line",
              lines,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("report.line")
            )}
          </div>
          <div className="row mt-4">
            <div className="col ms-4">
              <div className="row">
                <div className="col">
                  {this.renderInput(
                    "barcode",
                    "",
                    t("report.barcode"),
                    fields.barcode,
                    this.handleCustomInputChange,
                    errors.barcode,
                    true,
                    "text",
                    this.barcodeRef
                  )}
                </div>
                <div className="col-2 my-auto">
                  {this.renderButton(
                    t("report.clear"),
                    "button",
                    this.handleButtonClear,
                    "btn btn-primary btn-block mt-4"
                  )}
                </div>
              </div>
              <div
                className=" ms-2 mt-4 mb-4"
                style={{ fontWeight: "bold", width: "150px", height: "20px" }}
              >
                {t("report.total")}{" "}
                <span className="badge rounded-pill bg-info">
                  {data.length}
                </span>
              </div>
              <p> </p>
              {isActiveBarcode &&
                this.renderButton(
                  t("report.remont"),
                  "button",
                  this.handleButtonRemont,
                  "btn btn-warning text-white btn-block"
                )}
              <p> </p>
              {defects.map((defect) => (
                <ButtonBadge
                  onClick={this.handleButtonClick}
                  key={defect.id}
                  value={defect.name}
                  id={defect.id}
                  reports={data}
                  disabled={!fields.barcode || !!errors.barcode || isSubmitting}
                ></ButtonBadge>
              ))}
            </div>
            <div className="col">
              <ReportTable
                rows={rows}
                onSort={this.handleSort}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
              />
              <Pagination
                itemsCount={data.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withTranslation("reports")(Report);
