import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import Form from "./form";
import ModelTable from "../tables/modelTable";
import { paginate } from "../../utils/paginate";
import Pagination from "../common/pagination";
import StatusFilter, { filterByStatus } from "../common/statusFilter";
import {
  addModel,
  setModelStatus,
  getModelByProductBrandId,
} from "../../services/modelService";
import {
  getProductBrandByProductAndBrandId,
  getProductBrandByProductId,
} from "../../services/productBrandService";
import { toast } from "react-toastify";
import { getProducts } from "../../services/productService";

class ModelForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: {
      model: "",
      barcode: "",
      sapCode: "",
      boardId: "",
    },
    productBrand: {},
    products: [],
    selectedProduct: "",
    brands: [],
    selectedBrand: "",
    currentPage: 1,
    statusFilter: "active",
    selectedItem: { id: "", value: "" },
    pageSize: 25,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: products } = await getProducts();

      this.setState({ products, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleToggleStatus = async ({ id, isActive }) => {
    const clone = [...this.state.data];
    const data = clone.map((d) =>
      d.id === id ? { ...d, isActive: !isActive } : d
    );
    this.setState({ data, loading: true });

    try {
      await setModelStatus(id, !isActive);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.response?.data?.message || ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleStatusFilterChange = (statusFilter) => {
    this.setState({ statusFilter, currentPage: 1 });
  };

  handleSelectChange = async ({ target }) => {
    const { name, value } = target;
    if (!value) return;
    // TODO: Need to find other way. Here extra server call occuring
    try {
      switch (name) {
        case "Product":
          const { data: response } = await getProductBrandByProductId(value);
          const brands = response.map((p) => p.brand);
          this.setState({
            brands,
            data: [],
            selectedProduct: value,
          });
          break;
        case "Brand":
          const { selectedProduct } = this.state;
          const { data: productBrand } =
            await getProductBrandByProductAndBrandId(selectedProduct, value);
          const [{ data: active }, { data: disabled }] = await Promise.all([
            getModelByProductBrandId(productBrand.id, true),
            getModelByProductBrandId(productBrand.id, false),
          ]);
          this.setState({
            data: [...active, ...disabled],
            productBrand,
            currentPage: 1,
          });
          break;
        default:
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  doSubmit = async () => {
    const { data, productBrand, fields } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addModel({
        productBrandId: productBrand.id,
        name: fields.model,
        sapCode: fields.sapCode,
        barcode: fields.barcode,
        boardId: fields.boardId,
      });
      const newData = [result, ...data];
      this.setState({
        data: newData,
        loading: false,
        fields: { model: "", sapCode: "", barcode: "" },
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.response.data.message);
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  render() {
    const { t } = this.props;
    const {
      data: allData,
      pageSize,
      sortColumn,
      statusFilter,
      fields,
      products,
      brands,
      errors,
      loading,
    } = this.state;

    const filteredData = filterByStatus(allData, statusFilter);
    const itemsCount = filteredData.length;
    // Toggling a row can remove it from the current filter; keep the page in range.
    const currentPage = Math.min(
      this.state.currentPage,
      Math.max(1, Math.ceil(itemsCount / pageSize))
    );
    const sortedData = _.orderBy(
      filteredData,
      [sortColumn.path],
      [sortColumn.order]
    );

    const data = paginate(sortedData, currentPage, pageSize);

    return (
      <form className="m-2 row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <StatusFilter
            rows={allData}
            value={statusFilter}
            onChange={this.handleStatusFilterChange}
          />
          <ModelTable
            rows={data}
            sortColumn={sortColumn}
            onToggleStatus={this.handleToggleStatus}
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
            products,
            errors.products,
            this.handleSelectChange,
            "id",
            "name",
            t("forms:fields.product")
          )}
          <p className="mt-2"> </p>
          {this.renderSelect(
            "Brand",
            brands,
            errors.brands,
            this.handleSelectChange,
            "id",
            "name",
            t("forms:fields.brand")
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "model",
            t("forms:model.name"),
            "",
            fields.model,
            this.handleInputChange,
            errors.model,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "barcode",
            t("forms:model.barcode"),
            "",
            fields.barcode,
            this.handleInputChange,
            errors.model,
            false,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "sapCode",
            t("forms:model.sapCode"),
            "",
            fields.sapCode,
            this.handleInputChange,
            errors.model,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "boardId",
            t("forms:model.boardId"),
            "",
            fields.boardId,
            this.handleInputChange,
            errors.model,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderButton(t("common:buttons.save"))}
        </div>
      </form>
    );
  }
}

export default withTranslation(["forms", "common"])(ModelForm);
