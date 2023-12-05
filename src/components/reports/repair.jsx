import React, { Component } from "react";
import { toast } from "react-toastify";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import Form from "./../forms/form";
import PcbRepairTable from "../tables/pcbRepairTable";
import _ from "lodash";
import {
  getBarcodeHistory,
  getReportByBarcode,
  getReportByUpdatedDate,
  updateReport,
} from "../../services/reportService";
import { getPcbRepairers } from "../../services/pcbRepairerService";
import { format } from "date-fns";
import Pagination from "../common/pagination";
import { Link } from "react-router-dom";

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
    pageSize: 25,
    data: [],
    repairers: [],
    errors: {},
    loading: true,
    employee: "",
    reportId: "",
    psbStatus: true,
    reports: [],
  };

  async componentDidMount() {
    this.setState({ loading: true });
    try {
      const { data: repairers } = await getPcbRepairers();
      const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReportByUpdatedDate(date, true);
      this.setState({
        repairers,
        data,
        loading: false,
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

    if (
      employee === "" ||
      employee === undefined ||
      condition === "" ||
      condition === undefined
    ) {
      toast.warning("Remontchi va xolatini tanlang!");
      return;
    }

    this.setState({ loading: true });
    try {
      await updateReport(reportId, {
        status: true,
        employee,
        condition,
        action: fields.action,
      });

      const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReportByUpdatedDate(date, true);

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
      this.setState({
        loading: true,
        fields: { barcode: "", action: "", searchDate: "" },
        model: "",
        line: "",
        defect: "",
        createdDate: "",
        reportId: "",
      });
      const barcode = e.target.value;
      try {
        const { data: report } = await getReportByBarcode(barcode);
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

        const { data: reports } = await getBarcodeHistory(barcode);
        this.setState({ reports });
      } catch (ex) {
        toast.error(ex.response.data.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleSearch = async () => {
    const { psbStatus } = this.state;
    this.setState({ loading: true });
    try {
      const { data } = await getReportByUpdatedDate(
        this.state.fields.searchDate,
        psbStatus
      );
      console.log(data);
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
      reports,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="row">
          {reports && reports.length > 0 ? (
            <Link
              to={{
                pathname: "/repair-history",
              }}
              state={{
                data: {
                  reports,
                },
              }}
              className="btn btn-success text-white w-25"
            >
              HISTORY
            </Link>
          ) : (
            <></>
          )}
          <div className="mt-2 row">
            <div className="col-2">
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
            <div className="col-2">
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
          </div>

          <div className="mt-2 row">
            <div className="col">
              {this.renderTextArea(
                "action",
                "Action",
                fields.action,
                this.handleInputChange
              )}
            </div>

            <div className="col">
              <div className="row">
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
                      { id: "Ishladi", name: "Ishladi" },
                      { id: "Ishlamadi", name: "Ishlamadi" },
                    ],
                    errors.repairers,
                    this.handleSelectChange
                  )}
                </div>
                <div className="col mt-4">
                  {this.renderButton("SAVE", "button", this.handleSave)}
                </div>
              </div>
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
          {rows.length > 0 && (
            <PcbRepairTable
              rows={rows}
              onSort={this.handleSort}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
            />
          )}
          <Pagination
            itemsCount={data.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </>
    );
  }
}

export default Repair;
