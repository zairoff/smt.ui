import _ from "lodash";
import Form from "./form";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { paginate } from "../../utils/paginate";
import Pagination from "../common/pagination";
import PlanTable from "../tables/planTable";
import { format } from "date-fns";
import { getLines } from "../../services/lineService";
import {
  addPlanActivity,
  deletePlanActivity,
  getPlanActivityByDate,
} from "../../services/planActivityService";
import PlanActivityTable from "../tables/PlanActivityTable";

class PlanActivityForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: {
      lineId: "",
      issue: "",
      reason: "",
      action: "",
      responsible: "",
      status: "",
      createdDate: "",
      expireDate: "",
      searchDate: "",
    },
    lines: [],
    statuses: [
      { id: "Plan", name: "Plan" },
      { id: "Plan-Do", name: "Plan-Do" },
      { id: "Plan-Do-Act", name: "Plan-Do-Act" },
      { id: "Plan-Do-Act-Resolve", name: "Plan-Do-Act-Resolve" },
    ],
    currentPage: 1,
    selectedItem: { id: "", value: "" },
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getPlanActivityByDate(date, true);
      const { data: lines } = await getLines();

      this.setState({ data, lines, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  isDate = (date) => {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  };

  handleSearchDateChange = async ({ currentTarget: input }) => {
    const { value } = input;

    const errors = { ...this.state.errors };
    delete errors[input.id];
    const fields = { ...this.state.fields };
    fields[input.id] = value;

    if (this.isDate(value)) {
      try {
        this.setState({ fields, loading: true });
        const { data } = await getPlanActivityByDate(value);

        this.setState({ errors, data, loading: false });
      } catch (ex) {
        this.setState({ loading: false });
        toast.error(ex.message);
      }
    }
  };

  handleDateChange = async ({ currentTarget: input }) => {
    const { value } = input;

    const errors = { ...this.state.errors };
    delete errors[input.id];
    const fields = { ...this.state.fields };
    fields[input.id] = value;

    if (this.isDate(value)) {
      this.setState({ fields, errors });
    }
  };

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;
    const { fields } = this.state;
    if (name === "Status") {
      fields.status = id;
    } else {
      fields.lineId = id;
    }
    this.setState({ fields });
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deletePlanActivity(id);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSubmit = async () => {
    const { data, fields } = this.state;
    const {
      lineId,
      reason,
      issue,
      action,
      responsible,
      status,
      createdDate,
      expireDate,
    } = fields;

    if (
      lineId === "" ||
      reason === "" ||
      issue === "" ||
      responsible === "" ||
      status === "" ||
      createdDate === "" ||
      expireDate === ""
    ) {
      toast.warning("Kerakli ma'lumotlarni kiriting");
      return;
    }
    this.setState({ loading: true });
    try {
      const { data: result } = await addPlanActivity({
        lineId: fields.lineId,
        reason: fields.reason,
        issue: fields.issue,
        act: fields.action,
        responsible: fields.responsible,
        status: fields.status,
        date: fields.createdDate,
        expires: fields.expireDate,
      });
      const newData = [result, ...data];
      this.setState({
        data: newData,
        loading: false,
        fields: {
          lineId: fields.lineId,
          status: fields.status,
          issue: "",
          reason: "",
          action: "",
          responsible: "",
          createdDate: "",
          expireDate: "",
        },
      });
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.title);
    }
  };

  render() {
    const {
      fields,
      lines,
      statuses,
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
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "searchDate",
              "Search",
              "",
              fields.searchDate,
              this.handleSearchDateChange,
              errors.searchDate,
              true,
              "date"
            )}
          </div>
        </div>
        <br />
        <br />
        <br />

        <div className="row">
          <div className="col-4">
            {this.renderSelect("Line", lines, "", this.handleSelectChange)}
          </div>
          <div className="col-4">
            {this.renderInput(
              "issue",
              "Nomuvofiqlik",
              "",
              fields.issue,
              this.handleInputChange,
              errors.issue,
              true,
              ""
            )}
          </div>

          <div className="col-4">
            {this.renderInput(
              "reason",
              "Sabab",
              "",
              fields.reason,
              this.handleInputChange,
              errors.reason,
              true,
              ""
            )}
          </div>

          <p className="mt-2"> </p>

          <div className="col-4">
            {this.renderInput(
              "action",
              "To'g'irlash ishlari",
              "",
              fields.action,
              this.handleInputChange,
              errors.action,
              true,
              ""
            )}
          </div>

          <div className="col-4">
            {this.renderInput(
              "responsible",
              "Javobgar",
              "",
              fields.responsible,
              this.handleInputChange,
              errors.responsible,
              true,
              ""
            )}
          </div>

          <div className="col-4">
            {this.renderSelect("Status", statuses, "", this.handleSelectChange)}
          </div>

          <p className="mt-2"> </p>

          <div className="col-4">
            {this.renderInput(
              "createdDate",
              "Nomuvofiqlik sanasi",
              "",
              fields.createdDate,
              this.handleDateChange,
              errors.createdDate,
              true,
              "date"
            )}
          </div>

          <div className="col-4">
            {this.renderInput(
              "expireDate",
              "Muddat",
              "",
              fields.expireDate,
              this.handleDateChange,
              errors.expireDate,
              true,
              "date"
            )}
          </div>

          <div className="col-4 pt-4">
            {this.renderButton("Save", "button", this.handleSubmit)}
          </div>
          <p className="mt-2"> </p>
          <p className="mt-2"> </p>
          <div className="col">
            <PlanActivityTable
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
        </div>
      </>
    );
  }
}

export default PlanActivityForm;
