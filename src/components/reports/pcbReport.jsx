import React, { Component } from "react";
import {
  SortableContainer,
  SortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import arrayMove from "array-move";
import ReactLoading from "react-loading";
import Form from "../forms/form";
import ListGroup from "../common/listGroup";
import { getProducts } from "../../services/productService";
import {
  getProductBrandByProductAndBrandId,
  getProductBrandByProductId,
} from "../../services/productBrandService";
import { toast } from "react-toastify";
import { getModelByProductBrandId } from "../../services/modelService";
import { getLineDefectByLineId } from "../../services/lineDefectService";
import {
  addPcbReport,
  getPcbReportsByModelLineAndDate,
} from "../../services/pcbReportService";
import { getLines } from "../../services/lineService";
import { getEmployeeByDepartmentId } from "../../services/employeeService";
import { getDepartments } from "../../services/departmentService";
import config from "../../config.json";
import PcbCard from "./pcbCard";
import { format } from 'date-fns';

const fileUrl = config.fileUrl;

const SortableItem = SortableElement(
  ({
    name,
    employeeId,
    position,
    count,
    shouldUseDragHandle,
    onClick,
    hideItems,
  }) => (
    <PcbCard
      name={name}
      employeeId={employeeId}
      position={position}
      count={count}
      shouldUseDragHandle={shouldUseDragHandle}
      onClick={onClick}
      hideItems={hideItems}
    />
  )
);

const SortableList = SortableContainer((props) => {
  const { items, reports, onClick, hideItems, ...restProps } = props;

  return (
    <div className="d-flex flex-wrap mt-4">
      {items.map(({ id, fullName, imageUrl }, index) => {
        const { length } = reports.filter((r) => r.employee.id == id);
        return (
          <SortableItem
            key={`item-${id}`}
            index={index}
            position={index + 1}
            name={fullName}
            employeeId={id}
            imageUrl={imageUrl}
            onClick={onClick}
            hideItems={hideItems}
            {...restProps}
            count={length}
          />
        );
      })}
    </div>
  );
});

class PcbReport extends Form {
  state = {
    reports: [],
    departments: [],
    products: [],
    selectedProduct: "",
    productBrands: [],
    brands: [],
    selectedBrand: "",
    models: [],
    selectedModel: "",
    lines: [],
    selectedLine: "",
    defects: [],
    selectedDefect: "",
    employees: [],
    selectedEmployee: "",
    errors: {},
    loading: true,
    selectedListItem: "",
    hideItems: false,
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ employees }) => ({
      employees: arrayMove(employees, oldIndex, newIndex),
    }));
  };

  async componentDidMount() {
    try {
      const { data: products } = await getProducts();
      const { data: departments } = await getDepartments();
      this.setState({ products, departments, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
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
              brands,
              productBrands,
              selectedProduct: id,
              models: [],
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

            const { data: models } = await getModelByProductBrandId(
              productBrand[0].id
            );
            this.setState({
              selectedBrand: id,
              models,
              loading: false,
            });
          }
          break;
        case "Model":
          const { data: lines } = await getLines();

          this.setState({
            selectedModel: id,
            lines,
            reports: [],
            loading: false,
          });
          break;
        case "Line":
          {
            const { selectedModel } = this.state;

            if (!selectedModel) return;

            const { data: lineDefects } = await getLineDefectByLineId(id);
            const defects = lineDefects.map((ld) => ld.defect);

            const { data: reports } = await getPcbReportsByModelLineAndDate(
              selectedModel,
              id,
              format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            );
            this.setState({
              defects,
              selectedLine: id,
              reports,
              loading: false,
            });
          }
          break;
        case "Department":
          {
            const { data: employees } = await getEmployeeByDepartmentId(
              id,
              true
            );

            const { selectedModel, selectedLine } = this.state;
            const { data: reports } = await getPcbReportsByModelLineAndDate(
              selectedModel,
              selectedLine,
              format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            );
            this.setState({ employees, reports, loading: false });
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  handleListChange = (item) => {
    this.setState({ selectedListItem: item, selectedDefect: item.id });
  };

  handleCardClick = async ({ employeeId, position }) => {
    const {
      reports,
      selectedModel,
      selectedDefect,
      selectedLine,
      hideItems,
      employees,
    } = this.state;

    if (hideItems) {
      try {
        const filtered = employees.filter((e) => e.id != employeeId);
        this.setState({ employees: filtered });
      } catch (ex) {
        console.log("filer failed" + ex);
        this.setState({ employees });
      }
      return;
    }

    if (!selectedDefect) {
      toast.warning("Defektni tanlang!");
      return;
    }

    const report = {
      employeeId,
      modelId: selectedModel,
      lineId: selectedLine,
      defectId: selectedDefect,
      positionId: position,
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    const newReports = [
      ...reports,
      { employee: { id: employeeId }, defect: { id: selectedDefect } },
    ];
    this.setState({ reports: newReports, loading: true });
    try {
      await addPcbReport(report);
    } catch (ex) {
      this.setState({ reports });
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  cardHideClick = ({ employeeId }) => {
    console.log("filer clicked", employeeId);
  };

  handleCalibrationClick = (status) => {
    this.setState({ hideItems: status });
  };

  render() {
    const {
      products,
      brands,
      models,
      defects,
      lines,
      loading,
      reports,
      departments,
      employees,
      hideItems,
    } = this.state;
    return (
      <>
        <form className="row mt-4">
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
          <div className="col">
            {this.renderSelect("Model", models, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Line", lines, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect(
              "Department",
              departments,
              "",
              this.handleSelectChange,
              "departmentId",
              "name"
            )}
          </div>
        </form>
        <div className="row p-2">
          <div className="col-3 mt-2">
            <div
              className={
                hideItems ? "mb-2 btn btn-danger" : "mb-2 btn btn-success"
              }
              onClick={() => this.handleCalibrationClick(!hideItems)}
            >
              {hideItems ? "CALIBRATION" : "WORK"}
            </div>
            <ListGroup
              items={defects}
              reports={reports}
              selectedItem={this.state.selectedListItem}
              onItemSelect={this.handleListChange}
            ></ListGroup>
          </div>
          <div className="col">
            <SortableList
              shouldUseDragHandle={true}
              useDragHandle
              axis="xy"
              items={employees}
              reports={reports}
              onSortEnd={this.onSortEnd}
              onClick={this.handleCardClick}
              hideItems={hideItems}
            />
          </div>
        </div>
      </>
    );
  }
}

export default PcbReport;
