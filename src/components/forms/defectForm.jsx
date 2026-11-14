import React, { Component } from "react";
import BrandTable from "../tables/brandTable";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "./form";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  addDefect,
  setDefectStatus,
  getDefects,
} from "../../services/defectService";
import DefectTable from "../tables/defectTable";
import StatusFilter, { filterByStatus } from "../common/statusFilter";

class DefectForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { defect: "" },
    currentPage: 1,
    statusFilter: "active",
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const [{ data: active }, { data: disabled }] = await Promise.all([
        getDefects(true),
        getDefects(false),
      ]);
      this.setState({ data: [...active, ...disabled] });
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
      const { data: result } = await addDefect({ name: fields.defect });
      const newData = [result, ...data];
      this.setState({ data: newData, fields: { defect: "" } });
    } catch (ex) {
      this.catchExceptionMessage(ex, "defect");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleToggleStatus = async ({ id, isActive }) => {
    const clone = [...this.state.data];
    const data = clone.map((d) =>
      d.id === id ? { ...d, isActive: !isActive } : d
    );
    this.setState({ data, loading: true });

    try {
      await setDefectStatus(id, !isActive);
    } catch (ex) {
      this.setState({ data: clone });
      this.catchExceptionMessage(ex, "defect");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleStatusFilterChange = (statusFilter) => {
    this.setState({ statusFilter, currentPage: 1 });
  };

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
      sortColumn,
      statusFilter,
      loading,
      fields,
      errors,
    } = this.state;

    const filteredRows = filterByStatus(allRows, statusFilter);
    // Toggling a row can remove it from the current filter; keep the page in range.
    const currentPage = Math.min(
      this.state.currentPage,
      Math.max(1, Math.ceil(filteredRows.length / pageSize))
    );
    const sortedRows = _.orderBy(
      filteredRows,
      [sortColumn.path],
      [sortColumn.order]
    );
    const rows = paginate(sortedRows, currentPage, pageSize);
    return (
      <form className="m-2 row " onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <StatusFilter
            rows={allRows}
            value={statusFilter}
            onChange={this.handleStatusFilterChange}
          />
          <DefectTable
            rows={rows}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onToggleStatus={this.handleToggleStatus}
          />
          <Pagination
            itemsCount={filteredRows.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-4">
          {this.renderInput(
            "defect",
            "",
            "",
            fields.defect,
            this.handleInputChange,
            errors.defect,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderButton(this.props.t("common:buttons.save"))}
        </div>
      </form>
    );
  }
}

export default withTranslation("common")(DefectForm);
