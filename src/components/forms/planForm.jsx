import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { paginate } from "../../utils/paginate";
import Form from "./form";
import Pagination from "../common/pagination";
import { getModelByProductBrandId } from "../../services/modelService";
import { addPlan, deletePlan, getPlanByDate } from "../../services/planService";
import { getProductBrandByProductId } from "../../services/productBrandService";
import { getProducts } from "../../services/productService";
import PlanTable from "../tables/planTable";
import { format } from "date-fns";
import { getLines } from "../../services/lineService";
import _ from "lodash";

class Plan extends Form {
  state = {
    fields: {
      planProduced: "",
      planRequired: "",
      date: "",
    },
    products: [],
    productBrands: [],
    brands: [],
    models: [],
    lines: [],
    selectedItem: { productId: "", brandId: "", modelId: "", lineId: "" },
    data: [],
    errors: {},
    loading: true,
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 15,
  };

  async componentDidMount() {
    try {
      const { data } = await getPlanByDate(format(new Date(), "yyyy-MM-dd"));

      const { data: products } = await getProducts();

      const { data: lines } = await getLines();

      this.setState({ data, products, lines, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  isDate = (date) => {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  };

  handleDateChange = async ({ currentTarget: input }) => {
    const { value } = input;

    const errors = { ...this.state.errors };
    delete errors[input.id];
    const fields = { ...this.state.fields };
    fields[input.id] = value;

    if (this.isDate(value)) {
      try {
        const { data } = await getPlanByDate(value);

        this.setState({ fields, errors, data, loading: false });
      } catch (ex) {
        this.setState({ loading: false });
        toast.error(ex.message);
      }
    }
  };

  async componentDidUpdate() {
    const { fields } = this.state;
  }

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deletePlan(id);
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

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;
    this.setState({ loading: true });
    try {
      switch (name) {
        case "Line":
          {
            const { selectedItem, fields } = this.state;
            selectedItem.lineId = id;
            this.setState({
              selectedItem,
              fields: { planProduced: "", planRequired: "", date: fields.date },
              loading: false,
            });
          }
          break;
        case "Product":
          {
            const { fields, selectedItem } = this.state;
            const { data: productBrands } = await getProductBrandByProductId(
              id
            );
            const brands = productBrands.map((p) => p.brand);
            selectedItem.productId = id;
            selectedItem.brandId = null;
            selectedItem.modelId = null;
            this.setState({
              fields: { planProduced: "", planRequired: "", date: fields.date },
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
            const { productBrands, selectedItem, fields } = this.state;
            const productBrand = productBrands.filter(
              (pb) =>
                pb.product.id == selectedItem.productId && pb.brand.id == id
            );

            const { data: models } = await getModelByProductBrandId(
              productBrand[0].id
            );

            selectedItem.brandId = id;
            selectedItem.modelId = null;

            this.setState({
              fields: { planProduced: "", planRequired: "", date: fields.date },
              selectedItem,
              models,
              loading: false,
            });
          }
          break;
        case "Model":
          const { selectedItem, fields } = this.state;

          selectedItem.modelId = id;

          this.setState({
            selectedItem,
            fields: { planProduced: "", planRequired: "", date: fields.date },
            loading: false,
          });
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  doSubmit = async () => {
    const { data, selectedItem, fields } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addPlan({
        lineId: selectedItem.lineId,
        modelId: selectedItem.modelId,
        requiredCount: fields.planRequired,
        producedCount: fields.planProduced,
        date: fields.date,
      });
      const newData = [result, ...data];
      this.setState({
        data: newData,
        loading: false,
        fields: { planRequired: "", planProduced: "", date: fields.date },
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
    const {
      fields,
      products,
      brands,
      models,
      lines,
      errors,
      data,
      sortColumn,
      currentPage,
      pageSize,
      loading,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <form className="row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col-4">
          {this.renderInput(
            "date",
            "Date",
            "",
            fields.date,
            this.handleDateChange,
            errors.date,
            true,
            "date"
          )}
          <p className="mt-2"> </p>
          {this.renderSelect("Line", lines, "", this.handleSelectChange)}
          <p className="mt-2"> </p>
          {this.renderSelect("Product", products, "", this.handleSelectChange)}
          <p className="mt-2"> </p>
          {this.renderSelect("Brand", brands, "", this.handleSelectChange)}
          <p className="mt-2"> </p>
          {this.renderSelect("Model", models, "", this.handleSelectChange)}
          <p className="mt-2"></p>

          {this.renderInput(
            "planRequired",
            "Plan",
            "",
            fields.planRequired,
            this.handleInputChange,
            errors.planRequired,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "planProduced",
            "Produced",
            "",
            fields.planProduced,
            this.handleInputChange,
            errors.planProduced,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
        <div className="col">
          <PlanTable
            rows={rows}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={data.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </form>
    );
  }
}

export default Plan;
