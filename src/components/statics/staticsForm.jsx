import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import { getLines } from "../../services/lineService";
import {
  getModels,
} from "../../services/modelService";
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
    filters: [
      { id: 1, name: "All" },
      { id: 2, name: "Product" },
      { id: 3, name: "Brand" },
      { id: 4, name: "Model" },
      { id: 5, name: "Line" },
      { id: 6, name: "Defect" },
    ],
    sort: false,
    sortColumn: { path: "", order: "asc" },
    selectedItem: { modelId: '', lineId: '', shift: '' },
    fields: { from: "", to: "" },
    isFiltered: false,
    shifts: [{ id: 'day', name: 'day' }, { id: 'night', name: 'night' }],
  };

  async componentDidMount() {
    try {
      const { data } = await getModels();
      const models = [{ id: -1, name: "All" }, ...data];

      const { data: liness } = await getLines();
      const lines = [{ id: -1, name: "All" }, ...liness];

      this.setState({
        models,
        lines,
        loading: false,
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;

    try {
      switch (name) {
        case "Model":
          const { selectedItem } = this.state;
          selectedItem.modelId = id;

          this.setState({
            selectedItem,
            reports: [],
          });
          break;
        case "Line":
          {
            const { selectedItem } = this.state;
            selectedItem.lineId = id;
            this.setState({
              selectedItem,
              reports: [],
            });
          }
          break;
        case "Shift":
          {
            const { selectedItem } = this.state;
            selectedItem.shift = id;
            this.setState({
              selectedItem,
              reports: [],
            });
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  /*handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    const { from, to } = this.state.fields;

    if (!from || !to) return;

    this.setState({ loading: true });

    try {
      switch (id) {
        case "2": {
          const { data: reports } = await getByProduct(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        case "3": {
          const { data: reports } = await getByBrand(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        case "4": {
          const { data: reports } = await getByModel(from, to);
          console.log("eee", reports);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        case "5": {
          const { data: reports } = await getByLine(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        case "6": {
          const { data: reports } = await getByDefect(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }
        default:
          this.setState({ loading: false });
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };*/

  doSubmit = async () => {
    const {
      selectedItem,
      fields,
    } = this.state;

    const { modelId, lineId, shift } = selectedItem;

    this.setState({ loading: true });
    try {
      const { data: reports } = await getReportsBy(
        modelId,
        lineId,
        shift,
        fields.from,
        fields.to
      );
      this.setState({ reports, isFiltered: false });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      models,
      lines,
      reports,
      sortColumn,
      fields,
      isFiltered,
      loading,
      shifts,
    } = this.state;

    const excel = isFiltered
      ? reports
      : reports.map((d) => ({
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
              {this.renderSelect("Shift", shifts, "", this.handleSelectChange)}
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
            {/*<div className="col">
              {this.renderSelect(
                "Filter",
                filters,
                "",
                this.handleFilterChange
              )}
              </div>*/}
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
        {isFiltered ? (
          <StaticsGroupedTable
            rows={excel}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
        ) : (
          <StaticsTable
            rows={excel}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
        )}
      </>
    );
  }
}

export default StaticsForm;
