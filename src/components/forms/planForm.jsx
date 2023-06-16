import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { paginate } from "../../utils/paginate";
import Form from "./form";
import Pagination from "../common/pagination";
import { getModels } from "../../services/modelService";
import { addPlan, deletePlan, getPlanByDate } from "../../services/planService";
import PlanTable from "../tables/planTable";
import { format } from "date-fns";
import { getLines } from "../../services/lineService";
import _ from "lodash";

class Plan extends Form {
  state = {
    fields: {
      planProduced: "",
      planRequired: "",
      employee: "",
      date: "",
    },
    daynight: [
      { id: "Den", name: "Den" },
      { id: "Noch", name: "Noch" },
    ],
    models: [],
    lines: [],
    selectedItem: { modelId: "", lineId: "", day: "" },
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

      const { data: models } = await getModels();

      const { data: lines } = await getLines();

      this.setState({ data, models, lines, loading: false });
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
        this.setState({ loading: true });
        const { data } = await getPlanByDate(value);

        this.setState({ fields, errors, data, loading: false });
      } catch (ex) {
        this.setState({ loading: false });
        toast.error(ex.message);
      }
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
        case "Model":
          const { selectedItem, fields } = this.state;

          selectedItem.modelId = id;

          this.setState({
            selectedItem,
            fields: { planProduced: "", planRequired: "", date: fields.date },
            loading: false,
          });
          break;

        case "Day":
          {
            const { selectedItem, fields } = this.state;

            selectedItem.day = id;

            this.setState({
              selectedItem,
              fields: { date: fields.date },
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

  doSubmit = async () => {
    const { data, selectedItem, fields } = this.state;

    if (
      fields.planProduced === "" ||
      fields.planRequired === "" ||
      fields.date === "" ||
      selectedItem.lineId === "" ||
      selectedItem.modelId === "" ||
      fields.employee === ""
    ) {
      return;
    }

    this.setState({ loading: true });
    try {
      const { data: result } = await addPlan({
        lineId: selectedItem.lineId,
        modelId: selectedItem.modelId,
        employee: fields.employee,
        dayNight: selectedItem.day,
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
      models,
      lines,
      daynight,
      errors,
      data,
      sortColumn,
      currentPage,
      pageSize,
      loading,
    } = this.state;

    console.log(data);
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
          {this.renderSelect("Model", models, "", this.handleSelectChange)}
          <p className="mt-2"></p>
          {this.renderSelect("Day", daynight, "", this.handleSelectChange)}
          <p className="mt-2"></p>
          {this.renderInput(
            "employee",
            "Employee",
            "",
            fields.employee,
            this.handleInputChange,
            errors.employee,
            true,
            ""
          )}
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
          <p className="mb-2"> </p>
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
