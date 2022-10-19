import React, { Component } from "react";
import BrandTable from "../tables/brandTable";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "./form";
import { toast } from "react-toastify";
import { addLine, deleteLine, getLines } from "../../services/lineService";
import DefectTable from "../tables/defectTable";
import LineTable from "../tables/lineTable";

class LineForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { line: "" },
    currentPage: 1,
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data } = await getLines();
      this.setState({ data });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  doSubmit = async () => {
    const { data, fields } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addLine({ name: fields.line });
      const newData = [result, ...data];
      this.setState({ data: newData, fields: { line: "" } });
    } catch (ex) {
      this.catchExceptionMessage(ex, "line");
    } finally {
      this.setState({ loading: false });
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
      await deleteLine(id);
    } catch (ex) {
      this.setState({ data: clone });
      this.catchExceptionMessage(ex, "line");
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

  render() {
    const {
      data: allRows,
      pageSize,
      currentPage,
      sortColumn,
      loading,
      fields,
      errors,
    } = this.state;

    const sortedRows = _.orderBy(
      allRows,
      [sortColumn.path],
      [sortColumn.order]
    );
    const rows = paginate(sortedRows, currentPage, pageSize);
    return (
      <form className="container m-2 row " onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <LineTable
            rows={rows}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
          <Pagination
            itemsCount={allRows.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-4">
          {this.renderInput(
            "line",
            "",
            "",
            fields.line,
            this.handleInputChange,
            errors.line,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
      </form>
    );
  }
}

export default LineForm;
