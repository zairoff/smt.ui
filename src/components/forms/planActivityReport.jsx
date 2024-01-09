import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import { getPlanActivityByDateRangeAndStatus } from "../../services/planActivityService";
import PlanActivityReportTable from "../tables/PlanActivityReportTable";

class PlanActivityReport extends Form {
  state = {
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: false,
    sort: false,
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "", status: "" },
    data: [],
    statuses: [
      { id: "Plan", name: "Plan" },
      { id: "Plan-Do", name: "Plan-Do" },
      { id: "Plan-Do-Act", name: "Plan-Do-Act" },
      { id: "Plan-Do-Act-Resolve", name: "Plan-Do-Act-Resolve" },
    ],
  };

  doSubmit = async () => {
    const { fields } = this.state;

    this.setState({ loading: true });
    try {
      const { data } = await getPlanActivityByDateRangeAndStatus(
        fields.from,
        fields.to,
        fields.status
      );
      this.setState({ data, loading: false });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSelectChange = async ({ target }) => {
    const { value: id } = target;
    const { fields } = this.state;
    fields.status = id;
    this.setState({ fields });
  };

  render() {
    const { data, sortColumn, fields, loading, statuses } = this.state;

    const excel = data.map((a) => ({
      line: a.line.name,
      kiritilganSana: a.date,
      nomuvofiqlik: a.issue,
      sabab: a.reason,
      tugirlashishlari: a.act,
      muddat: a.expires,
      javobgarlar: a.responsible,
      xolati: a.status,
    }));
    return (
      <>
        <form className="border p-4 mt-2 mb-4" onSubmit={this.handleSubmit}>
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}

          <div className="row">
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
            <div className="col">
              {this.renderSelect(
                "Status",
                statuses,
                "",
                this.handleSelectChange
              )}
            </div>
            <div className="col-2">
              <p className="mt-4"></p>
              {this.renderButton("Search")}
            </div>
            <div className="col-2">
              <p className="mt-4"></p>
              <CSVLink
                className="btn btn-block btn-success btn-lg w-100"
                data={excel}
              >
                Excel
              </CSVLink>
            </div>
          </div>
        </form>
        <PlanActivityReportTable
          rows={data}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
        />
      </>
    );
  }
}

export default PlanActivityReport;
