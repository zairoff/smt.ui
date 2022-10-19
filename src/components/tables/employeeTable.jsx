import React, { Component } from "react";
import Table from "../common/table";
import config from "../../config.json";
import { Link } from "react-router-dom";

const fileUrl = config.fileUrl;

class EmployeeTable extends Component {
  columns = [
    {
      path: "image",
      content: (employee) => (
        <img
          src={fileUrl + employee.imageUrl}
          className="rounded-circle"
          style={{ height: "65px", width: "65px", objectFit: "cover" }}
        ></img>
      ),
    },
    { path: "fullName", label: "" },
    { path: "department.name", label: "" },
    { path: "phone", label: "" },
    {
      path: "edit",
      content: (employee) => (
        <Link
          to={{
            pathname: "/employee-edit/" + employee.id,
          }}
          state={{ data: employee }}
          className="link"
        >
          Edit
        </Link>
      ),
    },
    {
      path: "delete",
      content: (employee) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(employee)}
          className="btn btn-danger"
        >
          Delete
        </button>
      ),
    },
  ];
  render() {
    const { rows, sortColumn, onSort } = this.props;
    return (
      <Table
        columns={this.columns}
        rows={rows}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default EmployeeTable;
