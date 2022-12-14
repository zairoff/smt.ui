import React, { Component } from "react";
import { toast } from "react-toastify";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import Form from "./../forms/form";
import PcbRepairTable from "../tables/pcbRepairTable";
import _ from "lodash";
import {
  getReportByBarcode,
  getReportByDate,
  updateReport,
} from "../../services/reportService";
import { getPcbRepairers } from "../../services/pcbRepairerService";
import { format } from "date-fns";

class Repair extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { barcode: "", action: "", searchDate: "" },
    model: "",
    line: "",
    defect: "",
    condition: "",
    createdDate: "",
    currentPage: 1,
    pageSize: 15,
    data: [],
    repairers: [],
    errors: {},
    loading: true,
    employee: "",
    reportId: "",
    psbStatus: true,
  };

  async componentDidMount() {
    try {
      const { data: repairers } = await getPcbRepairers();
      const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReportByDate(date, true);
      this.setState({
        repairers,
        data,
      });
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
      case "Repairer":
        this.setState({ employee: value });
        break;
      case "Status":
        this.setState({ condition: value });
        break;
      case "PcbStatus":
        this.setState({ psbStatus: value });
        break;
      default:
        break;
    }
  };

  handleSave = async () => {
    const { employee, reportId, fields, condition } = this.state;

    if (employee == "" || condition == "") {
      toast.warning("Remontchi va xolatini tanlang!");
      return;
    }

    try {
      await updateReport(reportId, {
        status: true,
        employee,
        condition,
        action: fields.action,
      });

      const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReportByDate(date, true);

      this.setState({
        data,
        fields: { barcode: "", action: "" },
        model: "",
        line: "",
        defect: "",
        createdDate: "",
      });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const filtered = clone.filter((r) => r.id != id);
    this.setState({ data: filtered, loading: true });
    try {
      await updateReport(id, {
        status: false,
        employeeId: "",
        condition: "",
        action: "",
      });
    } catch (ex) {
      toast.error(ex.response.data.message);
      this.state({ data: clone });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleInputKeyPress = async (e) => {
    if (e.key === "Enter") {
      const searchDate = this.state.searchDate;
      this.setState({
        loading: true,
        fields: { barcode: "", action: "", searchDate: "" },
        model: "",
        line: "",
        defect: "",
        createdDate: "",
        reportId: "",
      });
      try {
        const { data: report } = await getReportByBarcode(e.target.value);
        if (Object.keys(report).length > 0) {
          this.setState({
            fields: {
              barcode: report.barcode,
              action: "",
              searchDate: "",
            },
            reportId: report.id,
            model: report.model.name,
            defect: report.defect.name,
            line: report.line.name,
            createdDate: format(
              Date.parse(report.createdDate),
              "yyyy-MM-dd HH:mm:ss"
            ),
          });
        }
      } catch (ex) {
        toast.error(ex.response.data.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleSearch = async () => {
    const { psbStatus } = this.state;
    try {
      const { data } = await getReportByDate(
        this.state.fields.searchDate,
        psbStatus
      );
      this.setState({ data });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      fields,
      model,
      defect,
      line,
      createdDate,
      data,
      sortColumn,
      errors,
      loading,
      pageSize,
      currentPage,
      repairers,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <div className="mt-2 row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="mt-2 row">
          <div className="col">
            {this.renderInput(
              "barcode",
              "Barcode",
              "",
              fields.barcode,
              this.handleInputChange,
              errors.barcode,
              true,
              "text",
              undefined,
              false,
              this.handleInputKeyPress
            )}
          </div>
          <div className="col">
            {this.renderInput(
              "model",
              "Model",
              "",
              model,
              this.handleInputChange,
              errors.model,
              true
            )}
          </div>
          <div className="col">
            {this.renderInput(
              "line",
              "Line",
              "",
              line,
              this.handleInputChange,
              errors.line,
              true
            )}
          </div>
          <div className="col">
            {this.renderInput(
              "defect",
              "Defect",
              "",
              defect,
              this.handleInputChange,
              errors.defect,
              true
            )}
          </div>
        </div>

        <div className="mt-2 row">
          <div className="col">
            {this.renderInput(
              "date",
              "Created date",
              "",
              createdDate,
              this.handleInputChange,
              errors.createdDate,
              true
            )}
          </div>
          <div className="col">
            {this.renderSelect(
              "Repairer",
              repairers,
              errors.repairers,
              this.handleSelectChange,
              "employee.fullName",
              "employee.fullName"
            )}
          </div>
          <div className="col">
            {this.renderSelect(
              "Status",
              [
                { id: 1, name: "Worked" },
                { id: 2, name: "Not Worked" },
              ],
              errors.repairers,
              this.handleSelectChange
            )}
          </div>
        </div>
        <div className="mt-2 row">
          <div className="col">
            {this.renderTextArea(
              "action",
              "Action",
              fields.action,
              this.handleInputChange
            )}
            <p className="mt-2"> </p>
            {this.renderButton("Save", "button", this.handleSave)}
          </div>
        </div>
        <div className="mt-2 row">
          <div className="col">
            {this.renderSelect(
              "PcbStatus",
              [
                { id: false, name: "Open" },
                { id: true, name: "Closed" },
              ],
              errors.repairers,
              this.handleSelectChange
            )}
          </div>
          <div className="col">
            {this.renderInput(
              "searchDate",
              "Date",
              "",
              fields.searchDate,
              this.handleInputChange,
              errors.searchDate,
              false,
              "date"
            )}
          </div>
          <div className="col mt-4">
            {this.renderButton("SEARCH", "button", this.handleSearch)}
          </div>
        </div>
        <div className="col">
          {rows.length > 0 && (
            <PcbRepairTable
              rows={rows}
              onSort={this.handleSort}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Repair;
