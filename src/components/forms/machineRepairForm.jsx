import _ from "lodash";
import React from "react";
import {
  addMachineRepair,
  deleteMachineRepair,
  getMachineRepairs,
} from "../../services/machineRepairService";
import Form from "./form";
import { toast } from "react-toastify";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import MachineRepairTable from "../tables/machineRepairTable";
import { getMachines } from "../../services/machineService";
import { getMachineRepairers } from "../../services/machineRepairerService";
import Pagination from "../common/pagination";
import jwtDecode from "jwt-decode";

class MachineRepairForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { issue: "", action: "", createdDate: "" },
    currentPage: 1,
    pageSize: 15,
    machines: [],
    data: [],
    repairers: [],
    errors: {},
    loading: true,
    employeeId: "",
    machineId: "",
    shift: "",
    user: "",
    daynight: [
      { id: "Den", name: "Den" },
      { id: "Noch", name: "Noch" },
    ],
  };

  async componentDidMount() {
    try {
      const { data: machines } = await getMachines();
      const { data: repairers } = await getMachineRepairers();
      const { data } = await getMachineRepairs();
      const jwt = localStorage.getItem("token");
      let user = "";
      if (jwt) {
        user = jwtDecode(jwt);
      }
      this.setState({ data, machines, repairers, user });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

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

  handleSelectChange = ({ target }) => {
    const { name, value } = target;
    switch (name) {
      case "Remontchi":
        this.setState({ employeeId: value });
        break;
      case "Uskuna":
        this.setState({ machineId: value });
        break;
      case "Smena":
        this.setState({ shift: value });
        break;
      default:
        break;
    }
  };

  doSubmit = async () => {
    const { employeeId, machineId, fields, data, shift } = this.state;
    const { issue, action, createdDate } = fields;
    this.setState({ loading: true });
    try {
      const { data: machineRepair } = await addMachineRepair({
        machineId,
        employeeId,
        issue,
        action,
        shift,
        createdDate,
      });
      this.setState({
        data: [machineRepair, ...data],
        fields: {
          issue: "",
          action: "",
          notificationDate: "",
          createdDate: "",
          shift: "",
        },
      });
    } catch (ex) {
      console.log("ex:", ex.response);
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const filter = clone.filter((r) => r.id != id);
    this.setState({ loading: true, data: filter });
    try {
      await deleteMachineRepair(id);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      data,
      repairers,
      loading,
      sortColumn,
      currentPage,
      pageSize,
      errors,
      machines,
      fields,
      daynight,
      user,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <form className="m-2" onSubmit={this.handleSubmit}>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="row shadow p-3 mb-5 bg-body rounded">
          <div className="col">
            {this.renderSelect(
              "Uskuna",
              machines,
              errors.machines,
              this.handleSelectChange
            )}
          </div>
          <div className="col">
            {this.renderSelect(
              "Remontchi",
              repairers,
              errors.repairers,
              this.handleSelectChange,
              "employee.id",
              "employee.fullName"
            )}
          </div>
          <div className="col">
            {this.renderSelect("Smena", daynight, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderInput(
              "createdDate",
              "Sana",
              "",
              fields.createdDate,
              this.handleInputChange,
              errors.createdDate,
              true,
              "datetime-local"
            )}
          </div>
          <div className="row mt-4">
            <div className="col">
              {this.renderTextArea(
                "issue",
                "Sabab",
                fields.issue,
                this.handleInputChange
              )}
            </div>
            <div className="col">
              {this.renderTextArea(
                "action",
                "Bajarildi",
                fields.action,
                this.handleInputChange
              )}
            </div>
            <div className="col-2 mt-4">
              {this.renderButton("Save", "submit")}
            </div>
          </div>
        </div>
        <div className="pb-4">
          {rows.length > 0 && (
            <MachineRepairTable
              rows={rows}
              onSort={this.handleSort}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
              user={user}
            />
          )}
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

export default MachineRepairForm;
