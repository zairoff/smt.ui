import _ from "lodash";
import React, { Component } from "react";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getDepartmentByHierarchyId } from "../../../services/departmentService";
import {
  getEmployeeByDepartmentId,
  patchEmployee,
} from "../../../services/employeeService";
import Department from "../../common/department";
import Pagination from "../../common/pagination";
import EmployeeTable from "../../tables/employeeTable";
import Form from "../form";
import { paginate } from "../../../utils/paginate";

class EmployeeDashboard extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    departments: [],
    data: [],
    fields: { department: "" },
    errors: {},
    loading: true,
    selected: { id: 0, departmentId: "", name: "" },
    currentPage: 1,
    pageSize: 7,
  };

  async componentDidMount() {
    try {
      const { data: departments } = await getDepartmentByHierarchyId("/");
      this.setState({ departments });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleDepartmentClick = async (selected) => {
    this.setState({ loading: true });
    try {
      const { data } = await getEmployeeByDepartmentId(
        selected.departmentId,
        true // active employees
      );
      this.setState({ data });
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

  handleDelete = async ({ id }) => {
    const { data } = this.state;
    const clone = [...data];
    const filter = data.filter((e) => e.id != id);
    this.setState({ loading: true, data: filter });
    try {
      await patchEmployee(id, false);
    } catch (ex) {
      toast.error(ex.response.data.message);
      this.setState({ data: clone });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      loading,
      data,
      errors,
      fields,
      pageSize,
      currentPage,
      sortColumn,
      departments,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <React.Fragment>
        <div className="mt-2 row">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="col-4 m-2">
            <p className="mt-4"> </p>
            <Link to="/employee-add" className="btn btn-primary p-2 w-100">
              ADD EMPLOYEE
            </Link>
            <p className="mt-2"> </p>
            <Department
              className="m-2"
              data={departments}
              onClick={this.handleDepartmentClick}
            />
          </div>
          <div className="col m-2">
            {this.renderInput(
              "search",
              "",
              "Search",
              fields.search,
              this.handleInputChange,
              errors.search,
              true
            )}
            <p className="mt-2"> </p>
            <EmployeeTable
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
      </React.Fragment>
    );
  }
}

export default EmployeeDashboard;
