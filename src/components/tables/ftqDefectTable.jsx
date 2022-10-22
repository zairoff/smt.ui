import React, { Component } from "react";
import Table from "../common/table";
import config from "../../config.json";
import { Link } from "react-router-dom";

const fileUrl = config.fileUrl;

class FtqDefectTable extends Component {
  columns = [
    { path: "defect", label: "DEFECT" },
    { path: "count", label: "COUNT" },
    {
      path: "more",
      content: (employee) => (
        <Link
          to={{
            pathname: "/employee-edit/" + employee.id,
          }}
          state={{ data: employee }}
          className="link"
        >
          More
        </Link>
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

export default FtqDefectTable;
