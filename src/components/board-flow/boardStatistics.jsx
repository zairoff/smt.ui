import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  addBoardReport,
  deleteBoardReport,
  getBoardReport,
  getBoardReportByReaderAndDate,
} from "../../services/board-flow/boardReportService";
import { getQrReaders } from "../../services/board-flow/qrReaderService";
import BoardReportTable from "../tables/board-flow/boardReportTable";
import BoardFlow from "./boardFlow";
import { line } from "fontawesome";
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
    fields: { qrCode: "", from: "", to: "" },
    successes: [],
    failures: [],
    errors: {},
    loading: true,
    selectedReader: "",
    readers: [],
    data: [],
  };

  async componentDidMount() {}

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  handleSelectChange = async ({ target }) => {
    const { value } = target;
    console.log(target);
    if (!value) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await getBoardReportByReaderAndDate(value, today);
    // TODO: Need to find other way. Here extra server call occuring
    this.setState({
      selectedReader: value,
      data,
    });
  };

  handleDelete = async ({ id }) => {};

  render() {
    const { data, filters, sortColumn, fields, loading, transactionType } =
      this.state;
    const lines = [
      { id: 1, name: "Parmi", passed: 21, failed: 2 },
      { id: 2, name: "Jutze", passed: 21, failed: 1 },
      { id: 3, name: "Valnavoy (PCB)", passed: 21, failed: 1 },
      { id: 4, name: "Aging", passed: 21, failed: 1 },
      { id: 5, name: "QC", passed: 21, failed: 1 },
    ];
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
        <BoardFlow lines={lines}></BoardFlow>
        <div className="mt-4">
          <BoardFlowTable
            rows={data}
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
