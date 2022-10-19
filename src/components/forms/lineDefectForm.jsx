import _ from "lodash";
import React from "react";
import { paginate } from "../../utils/paginate";
import Pagination from "../common/pagination";
import { toast } from "react-toastify";
import {
  addLineDefect,
  deleteLineDefect,
  getByLineId,
  getLineDefect,
  getLineDefectByLineId,
  getLineDefects,
} from "../../services/lineDefectService";
import Form from "./form";
import ReactLoading from "react-loading";
import { getLines } from "../../services/lineService";
import { getDefects } from "../../services/defectService";
import LineDefectTable from "../tables/lineDefectTable";

class LineDefectForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { lines: [], defects: [] },
    currentPage: 1,
    selectedItem: { line: "", defect: "" },
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: lineDefects } = await getLineDefects();
      const { data: lines } = await getLines();
      const { data: defects } = await getDefects();
      const fields = { lines, defects };
      this.setState({ data: lineDefects, fields });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  doSubmit = async () => {
    const { data, selectedItem } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addLineDefect({
        lineId: selectedItem.line,
        DefectId: selectedItem.defect,
      });
      const newData = [result, ...data];
      this.setState({ data: newData });
    } catch (ex) {
      toast.error(ex.response.data.message);
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
      await deleteLineDefect(id);
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

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleSelectChange = async ({ target }) => {
    const { name, value } = target;
    const { selectedItem } = this.state;
    if (!value) return;
    // TODO: Need to find other way. Here extra server call occuring
    try {
      switch (name) {
        case "Line":
          selectedItem.line = value;
          const { data } = await getLineDefectByLineId(value);
          this.setState({ data, selectedItem });
          break;
        case "Defect":
          selectedItem.defect = value;
          this.setState({ selectedItem });
          break;
        default:
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  render() {
    const {
      data: allData,
      pageSize,
      currentPage,
      sortColumn,
      fields,
      errors,
      loading,
    } = this.state;

    const itemsCount = allData.length;
    const sortedData = _.orderBy(
      allData,
      [sortColumn.path],
      [sortColumn.order]
    );

    const data = paginate(sortedData, currentPage, pageSize);

    return (
      <form className="container m-2 row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <LineDefectTable
            rows={data}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={itemsCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-5">
          {this.renderSelect(
            "Line",
            fields.lines,
            errors.lines,
            this.handleSelectChange
          )}
          <p className="mt-2"> </p>
          {this.renderSelect(
            "Defect",
            fields.defects,
            errors.defects,
            this.handleSelectChange
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
      </form>
    );
  }
}

export default LineDefectForm;
