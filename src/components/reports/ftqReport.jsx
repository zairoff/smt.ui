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
  ClosedDefectCountByLine,
  DefectCountByLine,
  DefectsByLine,
} from "../../services/staticsService";
import { Link, useLocation, useParams } from "react-router-dom";

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
    closedDefectsCount: "",
    errors: {},
    loading: true,
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 25,
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
      const stateData = this.props.location.state;
      if (stateData !== null) {
        const { data } = stateData;
        if (data !== null) {
          const { from, to, line } = data;

          const { data: lines } = await getLines();

          const { data: plans } = await getPlanByLineAndDate(line, from, to);

          const { data: defects } = await DefectsByLine(line, from, to);

          const { data: allDefects } = await DefectCountByLine(line, from, to);

          const { data: closedDefects } = await ClosedDefectCountByLine(
            line,
            from,
            to
          );

          this.setState({
            lines,
            loading: false,
            fields: { from, to },
            plans,
            defects,
            allDefectsCount: allDefects.count,
            closedDefectsCount: closedDefects.count,
            selectedLine: line,
          });
        }
      } else {
        const { data: lines } = await getLines();

        this.setState({ lines, loading: false, fields: { from: "", to: "" } });
      }
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleLineClick = async ({ id }) => {
    const { fields } = this.state;
    const { from, to } = fields;
    if (from === null || from === "" || to === null || to === "") {
      return;
    }
    this.setState({ loading: true });
    try {
      const { data: plans } = await getPlanByLineAndDate(id, from, to);

      const { data: defects } = await DefectsByLine(id, from, to);

      const { data: allDefects } = await DefectCountByLine(id, from, to);

      const { data: closedDefects } = await ClosedDefectCountByLine(
        id,
        from,
        to
      );

      this.setState({
        plans,
        defects,
        loading: false,
        allDefectsCount: allDefects.count,
        closedDefectsCount: closedDefects.count,
        selectedLine: id,
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  };

  handleDelete = async ({ id }) => {};

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
      closedDefectsCount,
      loading,
      selectedLine,
    } = this.state;

    const totalPlan = plans.reduce(
      (n, { requiredCount }) => n + requiredCount,
      0
    );

    const totalProduced = plans.reduce(
      (n, { producedCount }) => n + producedCount,
      0
    );

    const agingId = 7;
    const agingPlanLim = 0;
    const agingSifatLim = 0;

    const pcb1 = 3;
    const pcb1PlanLim = 100;
    const pcb1SifatLim = 98.8;

    const pcb2 = 4;
    const pcb2PlanLim = 100;
    const pcb2SifatLim = 98.5;

    const qc1 = 5;
    const qc1PlanLim = 100;
    const qc1SifatLim = 99.6;

    const qc2 = 6;
    const qc2PlanLim = 100;
    const qc2SifatLim = 99.7;

    const smt1 = 1;
    const smt1PlanLim = 100;
    const smt1SifatLim = 99.3;

    const smt2 = 2;
    const smt2PlanLim = 100;
    const smt2SifatLim = 99.5;

    const smt3 = 8;
    const smt3PlanLim = 100;
    const smt3SifatLim = 99.9;

    let planColor = true;
    let sifatColor = true;

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

      if (selectedLine === pcb1) {
        planColor = parseFloat(pcb1PlanLim) <= parseFloat(planPersent);
        sifatColor =
          parseFloat(pcb1SifatLim) <= parseFloat(totalDefectsPersent);
      }

      if (selectedLine == pcb2) {
        planColor = pcb2PlanLim <= planPersent;
        sifatColor = pcb2SifatLim <= totalDefectsPersent;
      }

      if (selectedLine == qc1) {
        planColor = qc1PlanLim <= planPersent;
        sifatColor = qc1SifatLim <= totalDefectsPersent;
      }

      if (selectedLine == qc2) {
        planColor = qc2PlanLim <= planPersent;
        sifatColor = qc2SifatLim <= totalDefectsPersent;
      }

      if (selectedLine == smt1) {
        planColor = smt1PlanLim <= planPersent;
        sifatColor = smt1SifatLim <= totalDefectsPersent;
      }

      if (selectedLine == smt2) {
        planColor = smt2PlanLim <= planPersent;
        sifatColor = smt2SifatLim <= totalDefectsPersent;
      }

      if (selectedLine == smt3) {
        planColor = smt3PlanLim <= planPersent;
        sifatColor = smt3SifatLim <= totalDefectsPersent;
      }
    }

    const totalPlanText = "Plan: " + totalPlan;
    const totalProducedText = "Produced: " + totalProduced;

    const totalDefedctText = "Defects: " + allDefectsCount;
    const totalClosedDefectsText = "Closed: " + closedDefectsCount;

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
                    planColor
                      ? "btn btn-block btn-success rounded-circle mb-5 fw-bold fs-3"
                      : "btn btn-block btn-danger rounded-circle mb-5 fw-bold fs-3"
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
              "btn btn-success ms-2"
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
                    sifatColor
                      ? "btn btn-block btn-success rounded-circle mb-5 fw-bold fs-3"
                      : "btn btn-block btn-danger rounded-circle mb-5 fw-bold fs-3"
                  }
                  style={{ width: "130px", height: "130px" }}
                >
                  {totalDefectsPersent + "%"}
                </button>
              </div>
            </div>
            <Link
              to={{
                pathname: "/detailed",
              }}
              state={{
                data: {
                  from: fields.from,
                  to: fields.to,
                  line: selectedLine,
                  status: true,
                  display: "all",
                  defectName: undefined,
                },
              }}
              className="btn btn-danger"
            >
              {totalDefedctText}
            </Link>
            <Link
              to={{
                pathname: "/detailed",
              }}
              state={{
                data: {
                  from: fields.from,
                  to: fields.to,
                  line: selectedLine,
                  status: true,
                  display: "closed",
                  defectName: undefined,
                },
              }}
              className="btn btn-success ms-2"
            >
              {totalClosedDefectsText}
            </Link>
            <div className="mt-4">
              <FtqDefectTable
                rows={defectRows}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
                fields={fields}
                line={selectedLine}
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

export default () => (
  <FtqReport params={useParams()} location={useLocation()} />
);
