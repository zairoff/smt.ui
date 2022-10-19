import _ from "lodash";
import React from "react";
import { getDepartmentByHierarchyId } from "../../services/departmentService";
import { getEmployeeByDepartmentId } from "../../services/employeeService";
import {
  addMachineRepairer,
  deleteMachineRepairer,
  getMachineRepairers,
} from "../../services/machineRepairerService";
import Department from "../common/department";
import MachineRepairerTable from "../tables/machineRepairerTable";
import Form from "./form";
import { toast } from "react-toastify";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";

class MachineRepairerForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 15,
    departments: [],
    data: [],
    repairers: [],
    errors: {},
    loading: true,
    employeeId: "",
  };

  async componentDidMount() {
    try {
      const { data: departments } = await getDepartmentByHierarchyId("/");
      const { data } = await getMachineRepairers();
      this.setState({ departments, data });
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

  handleDepartmentSelect = async (selected) => {
    this.setState({ loading: true });
    try {
      const { data: repairers } = await getEmployeeByDepartmentId(
        selected.departmentId,
        true
      );
      this.setState({ repairers });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSelectChange = ({ target }) => {
    this.setState({ employeeId: target.value });
  };

  doSubmit = async () => {
    const { employeeId, data } = this.state;
    try {
      const { data: repairer } = await addMachineRepairer({
        employeeid: employeeId,
      });
      this.setState({ data: [repairer, ...data] });
    } catch (ex) {
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
      await deleteMachineRepairer(id);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      departments,
      data,
      repairers,
      loading,
      sortColumn,
      currentPage,
      pageSize,
      errors,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <form className="container m-2 row" onSubmit={this.handleSubmit}>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col m-2">
          {rows.length > 0 && (
            <MachineRepairerTable
              rows={rows}
              onSort={this.handleSort}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
            />
          )}
        </div>
        <div className="col-3 m-2">
          <Department
            data={departments}
            onClick={this.handleDepartmentSelect}
          />
        </div>
        <div className="col-3 m-2">
          {this.renderSelect(
            "Repairers",
            repairers,
            errors.repairers,
            this.handleSelectChange,
            "id",
            "fullName"
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save", "submit")}
        </div>
      </form>
    );
  }
}

export default MachineRepairerForm;
