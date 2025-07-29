import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  GetBoardFlowReports,
  GetMissingBoardFlowReports,
  GetPassedBoardFlowReports,
} from "../../services/board-flow/boardReportService";
import BoardFlow from "./boardFlow";
import BoardFlowTable from "../tables/board-flow/boardFlowTable";

/*
    public enum BoardPassStatus
    {
        Passed = 0,
        MissingPreviousPass = 1,
        Deleted = 2,
    }
*/
class BoardStatistics extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "" },
    successes: [],
    failures: [],
    errors: {},
    loading: false,
    data: [],
    reports: [],
  };

  async componentDidMount() {}

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  handleSearch = async () => {
    const { fields } = this.state;

    if (!fields.from || !fields.to) return;

    this.setState({ loading: true });
    try {
      const { data } = await GetBoardFlowReports(fields.from, fields.to);
      console.log(data);
      this.setState({ data });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleCircleClick = async ({ id, passed }) => {
    console.log("Clicked Reader ID:", id);
    console.log("pased:", passed);

    const { fields } = this.state;

    if (!fields.from || !fields.to) return;

    this.setState({ loading: true });
    try {
      const { data } = passed
        ? await GetPassedBoardFlowReports(id, fields.from, fields.to)
        : await GetMissingBoardFlowReports(id, fields.from, fields.to);
      console.log(data);
      this.setState({ reports: data });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, reports, sortColumn, fields, loading } = this.state;
    return (
      <>
        <div className="mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="row pt-2">
            <div className="col">
              {this.renderInput(
                "from",
                "From",
                "",
                fields.from,
                this.handleInputChange,
                "",
                true,
                "date"
              )}
            </div>
            <div className="col">
              {this.renderInput(
                "to",
                "To",
                "",
                fields.to,
                this.handleInputChange,
                "",
                true,
                "date"
              )}
            </div>
            <div className="col-2">
              <p className="mt-4"></p>
              {this.renderButton("SEARCH", "button", this.handleSearch)}
            </div>
          </div>
        </div>
        <BoardFlow
          lines={data}
          onCircleClick={this.handleCircleClick}
        ></BoardFlow>
        <div className="mt-4">
          <BoardFlowTable
            rows={reports}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
        </div>
      </>
    );
  }
}

export default BoardStatistics;
