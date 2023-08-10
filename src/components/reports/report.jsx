import React from "react";
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
    data: [],
    errors: {},
    loading: true,
    isActiveBarcode: false,
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
              brands,
              productBrands,
              selectedItem: {
                productId: id,
                brandId: "",
                modelId: "",
                lineId: "",
              },
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
              selectedItem,
              models,
              loading: false,
            });
          }
          break;
        case "Model":
          const { selectedItem } = this.state;

          selectedItem.modelId = id;
          selectedItem.lineId = null;

          this.setState({
            selectedItem,
            fields: { barcode: "" },
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

  handleCustomInputChange = async ({ currentTarget: input }) => {
    const { value } = input;

    const errors = { ...this.state.errors };
    delete errors[input.id];
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
      toast.warning("Check model choosen and barcode scanned");
      return;
    }

    const report = {
      barcode: fields.barcode,
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
    }
  };

  handleButtonClear = () => {
    this.setState({ fields: { barcode: "" } });
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
        condition: "OK",
        action: "Payka qilindi",
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
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

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
              this.handleSelectChange
            )}
          </div>
          <div className="col">
            {this.renderSelect("Brand", brands, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Model", models, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Line", lines, "", this.handleSelectChange)}
          </div>
          <div className="row mt-4">
            <div className="col ms-4">
              <div className="row">
                <div className="col">
                  {this.renderInput(
                    "barcode",
                    "",
                    "Barcode",
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
                    "CLEAR",
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
                TOTAL:{" "}
                <span className="badge rounded-pill bg-info">
                  {data.length}
                </span>
              </div>
              <p> </p>
              {isActiveBarcode &&
                this.renderButton(
                  "REMONT",
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

export default Report;
