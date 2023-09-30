import React from "react";
import Form from "../forms/form";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import FtqPlanTable from "../tables/ftqPlanTable";
import FtqDefectTable from "../tables/ftqDefectTable";
import _ from "lodash";
import { paginate } from "../../utils/paginate";
import Pagination from "../common/pagination";
import { getLines } from "../../services/lineService";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { getPlanByLineAndDate } from "../../services/planService";
import {
  getDefectCountByLine,
  getDefectsByLine,
} from "../../services/staticsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

class FtqReport extends Form {
  state = {
    fields: {
      from: "",
      to: "",
    },
    selectedLine: "",
    lines: [],
    plans: [],
    defects: [],
    allDefectsCount: "",
    errors: {},
    loading: true,
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 10,
    daynight: [
      { id: "Den", name: "Den" },
      { id: "Noch", name: "Noch" },
    ],
    shift: "",
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  async componentDidMount() {
    try {
      const { data: lines } = await getLines();

      this.setState({ lines, loading: false, fields: { from: "", to: "" } });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleLineClick = async ({ id }) => {
    const { fields, shift } = this.state;
    const { from, to } = fields;
    if (from === null || from === "" || to === null || to === "") {
      return;
    }
    this.setState({ loading: true });
    try {
      const { data: plans } = await getPlanByLineAndDate(id, shift, from, to);

      const { data: defects } = await getDefectsByLine(id, shift, from, to);

      const { data: allDefects } = await getDefectCountByLine(
        id,
        shift,
        from,
        to
      );

      this.setState({
        plans,
        defects,
        loading: false,
        allDefectsCount: allDefects.count,
        selectedLine: id,
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  };

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;
    try {
      switch (name) {
        case "SMENA":
          {
            this.setState({
              shift: id,
            });
          }

          break;
      }
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  render() {
    const {
      fields,
      plans,
      defects,
      lines,
      sortColumn,
      currentPage,
      pageSize,
      allDefectsCount,
      loading,
      selectedLine,
      daynight,
    } = this.state;

    const totalPlan = plans.reduce(
      (n, { requiredCount }) => n + requiredCount,
      0
    );

    const totalPlanSize = plans.reduce((sum, curr) => {
      return sum + curr.producedCount * curr.model.size;
    }, 0);

    const totalDefectSize = defects.reduce((sum, curr) => {
      return sum + curr.size;
    }, 0);

    const totalProduced = plans.reduce(
      (n, { producedCount }) => n + producedCount,
      0
    );

    let planPersent = 0;
    let planPersentText = "0%";
    let totalDefectsPersent = 0;
    if (totalPlan > 0 && totalProduced > 0) {
      planPersent = (totalProduced * 100) / totalPlan;
      planPersent = planPersent.toFixed(2);
      planPersentText = planPersent + "%";

      totalDefectsPersent = (
        100 -
        (allDefectsCount * 100) / totalProduced
      ).toFixed(2);
    }

    const totalPlanText = "Reja: " + totalPlan;
    const totalProducedText = "Chiqarildi: " + totalProduced;
    const totalPlanSizeText = "Size: " + totalPlanSize + " m2";
    const totalDefectSizeText = "Size: " + totalDefectSize + " m2";

    const totalDefedctText = "Nuqsonlar: " + allDefectsCount;

    const sortedPlanRows = _.orderBy(
      plans,
      [sortColumn.path],
      [sortColumn.order]
    );
    const planRows = paginate(sortedPlanRows, currentPage, pageSize);

    const sortedDefectRows = _.orderBy(
      defects,
      [sortColumn.path],
      [sortColumn.order]
    );
    const defectRows = paginate(sortedDefectRows, currentPage, pageSize);

    return (
      <>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <form className="row m-2">
          <div className="col-3">
            {this.renderInput(
              "from",
              "",
              "",
              fields.from,
              this.handleInputChange,
              "",
              true,
              "date"
            )}
            {this.renderInput(
              "to",
              "",
              "",
              fields.to,
              this.handleInputChange,
              "",
              true,
              "date"
            )}
            <p className="mt-4"></p>
            {this.renderSelect("SMENA", daynight, "", this.handleSelectChange)}
            <p className="mt-4"></p>
            {lines.map((line) => (
              <div key={line.id} className="mt-2">
                {" "}
                {this.renderButton(
                  line.name,
                  "button",
                  () => this.handleLineClick(line),
                  "btn btn-secondary btn-block btn-lg w-100 p-4"
                )}
              </div>
            ))}
          </div>
          <div className="col m-2">
            <div className="container d-flex align-items-center justify-content-center">
              <div>
                <button
                  type="button"
                  className={
                    "btn btn-block btn-success rounded-circle mb-5 fw-bold fs-3"
                  }
                  style={{ width: "130px", height: "130px" }}
                >
                  {planPersentText}
                </button>
              </div>
            </div>
            {this.renderButton(
              totalPlanText,
              "button",
              null,
              "btn btn-primary"
            )}
            {this.renderButton(
              totalProducedText,
              "button",
              null,
              "btn btn-primary ms-2"
            )}
            {this.renderButton(
              totalPlanSizeText,
              "button",
              null,
              "btn btn-primary ms-2"
            )}
            <div className="mt-4">
              <FtqPlanTable
                rows={planRows}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
              <Pagination
                itemsCount={plans.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
            </div>
          </div>
          <div className="col m-2">
            <div className="container d-flex align-items-center justify-content-center">
              <div>
                <button
                  type="button"
                  className={
                    "btn btn-block btn-success rounded-circle mb-5 fw-bold fs-3"
                  }
                  style={{ width: "130px", height: "130px" }}
                >
                  {totalDefectsPersent + "%"}
                </button>
              </div>
            </div>
            {this.renderButton(
              totalDefedctText,
              "button",
              null,
              "btn btn-danger ms-2"
            )}
            {this.renderButton(
              totalDefectSizeText,
              "button",
              null,
              "btn btn-danger ms-2"
            )}
            <div className="mt-4">
              <FtqDefectTable
                rows={defectRows}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
              <Pagination
                itemsCount={defects.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default FtqReport;
