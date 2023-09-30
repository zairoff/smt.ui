import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import { getLines } from "../../services/lineService";
import { getModels } from "../../services/modelService";
import { getReportsBy } from "../../services/reportService";
import Form from "../forms/form";
import StaticsGroupedTable from "../tables/staticsGroupedTable";
import StaticsTable from "../tables/staticsTable";
import ReactLoading from "react-loading";
import { format } from "date-fns";

class StaticsForm extends Form {
  state = {
    models: [],
    lines: [],
    reports: [],
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: true,
    sort: false,
    sortColumn: { path: "", order: "asc" },
    selectedModel: "",
    selectedLine: "",
    fields: { from: "", to: "" },
    daynight: [
      { id: "Den", name: "Den" },
      { id: "Noch", name: "Noch" },
    ],
    shift: "",
  };

  async componentDidMount() {
    try {
      const { data } = await getModels();
      const models = [{ id: -1, name: "All" }, ...data];

      this.setState({
        models,
        loading: false,
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;

    this.setState({ loading: true });
    try {
      switch (name) {
        case "Model": {
          const { data } = await getLines();

          const lines = [{ id: -1, name: "All" }, ...data];

          this.setState({
            selectedModel: id,
            lines,
            reports: [],
            loading: false,
          });
          break;
        }
        case "Line":
          {
            this.setState({
              selectedLine: id,
              reports: [],
              loading: false,
            });
          }
          break;

        case "Smena":
          {
            this.setState({
              shift: id,
              reports: [],
              loading: false,
            });
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  doSubmit = async () => {
    const { selectedModel, selectedLine, shift, fields } = this.state;

    this.setState({ loading: true });
    try {
      const { data: reports } = await getReportsBy(
        selectedModel,
        selectedLine,
        shift,
        fields.from,
        fields.to
      );
      this.setState({ reports });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { models, lines, reports, sortColumn, fields, loading, daynight } =
      this.state;

    const excel = reports.map((d) => ({
      id: d.id,
      barcode: d.barcode,
      model: d.model.name,
      line: d.line.name,
      defect: d.defect.name,
      shift: d.shift,
      date: format(Date.parse(d.createdDate), "yyyy-MM-dd HH:mm:ss"),
    }));

    return (
      <>
        <form className="border p-4 mt-2 mb-4" onSubmit={this.handleSubmit}>
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="row">
            <div className="col">
              {this.renderSelect("Model", models, "", this.handleSelectChange)}
            </div>
            <div className="col">
              {this.renderSelect("Line", lines, "", this.handleSelectChange)}
            </div>
            <div className="col">
              {this.renderSelect(
                "Smena",
                daynight,
                "",
                this.handleSelectChange
              )}
            </div>
          </div>

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
        <StaticsTable
          rows={excel}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
        />
      </>
    );
  }
}

export default StaticsForm;
