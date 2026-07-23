import React from "react";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { format, subDays } from "date-fns";
import ReactLoading from "react-loading";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import Form from "../forms/form";
import {
  getPlanStatics,
  getQualityStatics,
  getPlanDetailsByDate,
  getQualityDetailsByDate,
} from "../../services/staticsService";
import { getLines } from "../../services/lineService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

class PlanQualityStatics extends Form {
  state = {
    fields: { from: "", to: "" },
    lines: [],
    selectedLine: "",
    planStatics: [],
    qualityStatics: [],
    loading: false,
    errors: {},
    showPlanDetail: false,
    planDetailDate: null,
    planDetails: [],
    planDetailLoading: false,
    showQualityDetail: false,
    qualityDetailDate: null,
    qualityDetails: [],
    qualityDetailLoading: false,
  };

  async componentDidMount() {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), 6), "yyyy-MM-dd");

    this.setState({ fields: { from, to } });

    try {
      const { data } = await getLines();
      const lines = [
        { id: -1, name: this.props.t("planQualityStatics.all") },
        ...data,
      ];

      this.setState({ lines });
    } catch (ex) {
      toast.error(ex.message);
    }

    await this.fetchStatics(from, to, this.state.selectedLine);
  }

  handleLineChange = ({ target }) => {
    const { value: selectedLine } = target;
    const { from, to } = this.state.fields;

    this.setState({ selectedLine });
    this.fetchStatics(from, to, selectedLine);
  };

  fetchStatics = async (from, to, selectedLine) => {
    const lineId =
      selectedLine && selectedLine !== "-1" ? selectedLine : undefined;

    this.setState({ loading: true });
    try {
      const [{ data: planStatics }, { data: qualityStatics }] =
        await Promise.all([
          getPlanStatics(from, to, lineId),
          getQualityStatics(from, to, lineId),
        ]);

      this.setState({ planStatics, qualityStatics, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  };

  doSubmit = async () => {
    const { from, to } = this.state.fields;
    const { selectedLine } = this.state;

    if (!from || !to) return;

    await this.fetchStatics(from, to, selectedLine);
  };

  handlePlanBarClick = (event, elements) => {
    if (!elements || elements.length === 0) return;

    const { planStatics } = this.state;
    const { date } = planStatics[elements[0].index];

    this.openPlanDetail(date);
  };

  openPlanDetail = async (date) => {
    const { selectedLine } = this.state;
    const lineId =
      selectedLine && selectedLine !== "-1" ? selectedLine : undefined;

    this.setState({
      showPlanDetail: true,
      planDetailDate: date,
      planDetailLoading: true,
      planDetails: [],
    });

    try {
      const { data: planDetails } = await getPlanDetailsByDate(
        format(new Date(date), "yyyy-MM-dd"),
        lineId
      );

      this.setState({ planDetails, planDetailLoading: false });
    } catch (ex) {
      this.setState({ planDetailLoading: false });
      toast.error(ex.message);
    }
  };

  closePlanDetail = () => {
    this.setState({ showPlanDetail: false });
  };

  handleQualityPointClick = (event, elements) => {
    if (!elements || elements.length === 0) return;

    const { qualityStatics } = this.state;
    const { date } = qualityStatics[elements[0].index];

    this.openQualityDetail(date);
  };

  openQualityDetail = async (date) => {
    const { selectedLine } = this.state;
    const lineId =
      selectedLine && selectedLine !== "-1" ? selectedLine : undefined;

    this.setState({
      showQualityDetail: true,
      qualityDetailDate: date,
      qualityDetailLoading: true,
      qualityDetails: [],
    });

    try {
      const { data: qualityDetails } = await getQualityDetailsByDate(
        format(new Date(date), "yyyy-MM-dd"),
        lineId
      );

      this.setState({ qualityDetails, qualityDetailLoading: false });
    } catch (ex) {
      this.setState({ qualityDetailLoading: false });
      toast.error(ex.message);
    }
  };

  closeQualityDetail = () => {
    this.setState({ showQualityDetail: false });
  };

  render() {
    const {
      fields,
      lines,
      planStatics,
      qualityStatics,
      loading,
      showPlanDetail,
      planDetailDate,
      planDetails,
      planDetailLoading,
      showQualityDetail,
      qualityDetailDate,
      qualityDetails,
      qualityDetailLoading,
    } = this.state;
    const { t } = this.props;

    const planChartData = {
      labels: planStatics.map((p) => format(new Date(p.date), "yyyy-MM-dd")),
      datasets: [
        {
          label: t("planQualityStatics.chart.plan"),
          data: planStatics.map((p) => p.planned),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: t("planQualityStatics.chart.produced"),
          data: planStatics.map((p) => p.produced),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };

    const qualityChartData = {
      labels: qualityStatics.map((q) => format(new Date(q.date), "yyyy-MM-dd")),
      datasets: [
        {
          label: t("planQualityStatics.chart.quality"),
          data: qualityStatics.map((q) => q.ftq),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.3)",
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHitRadius: 20,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
      },
    };

    const planChartOptions = {
      ...chartOptions,
      onClick: (event, elements) => this.handlePlanBarClick(event, elements),
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length
          ? "pointer"
          : "default";
      },
    };

    const qualityChartOptions = {
      ...chartOptions,
      onClick: (event, elements) =>
        this.handleQualityPointClick(event, elements),
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length
          ? "pointer"
          : "default";
      },
    };

    return (
      <div className="full-bleed">
        <div className="container-fluid px-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <form className="border p-4 mt-2 mb-4" onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col">
                {this.renderInput(
                  "from",
                  t("planQualityStatics.from"),
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
                  t("planQualityStatics.to"),
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
                  "Line",
                  lines,
                  "",
                  this.handleLineChange,
                  "id",
                  "name",
                  t("planQualityStatics.line")
                )}
              </div>
              <div className="col-2">
                <p className="mt-4"></p>
                {this.renderButton(t("planQualityStatics.search"))}
              </div>
            </div>
          </form>

          <div className="row">
            <div className="col-lg-6 mb-4">
              <h5>{t("planQualityStatics.planTitle")}</h5>
              <p className="text-muted small">
                {t("planQualityStatics.planHint")}
              </p>
              <div style={{ height: "70vh" }}>
                <Bar data={planChartData} options={planChartOptions} />
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <h5>{t("planQualityStatics.qualityTitle")}</h5>
              <p className="text-muted small">
                {t("planQualityStatics.qualityHint")}
              </p>
              <div style={{ height: "70vh" }}>
                <Line data={qualityChartData} options={qualityChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {showPlanDetail && (
          <>
            <div className="modal show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {t("planQualityStatics.planDetailsTitle", {
                        date:
                          planDetailDate &&
                          format(new Date(planDetailDate), "yyyy-MM-dd"),
                      })}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={this.closePlanDetail}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {planDetailLoading && (
                      <ReactLoading
                        className="loading"
                        type="spin"
                        color="blue"
                      />
                    )}
                    {!planDetailLoading && planDetails.length === 0 && (
                      <p className="mb-0">
                        {t("planQualityStatics.noPlanData")}
                      </p>
                    )}
                    {!planDetailLoading && planDetails.length > 0 && (
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>{t("planQualityStatics.columns.line")}</th>
                            <th>{t("planQualityStatics.columns.model")}</th>
                            <th>{t("planQualityStatics.columns.planned")}</th>
                            <th>{t("planQualityStatics.columns.produced")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planDetails.map((d) => (
                            <tr key={d.lineId + "-" + d.modelId}>
                              <td>{d.lineName}</td>
                              <td>{d.modelName}</td>
                              <td>{d.planned}</td>
                              <td>{d.produced}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={this.closePlanDetail}
                    >
                      {t("common:buttons.close")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show"></div>
          </>
        )}

        {showQualityDetail && (
          <>
            <div className="modal show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {t("planQualityStatics.qualityDetailsTitle", {
                        date:
                          qualityDetailDate &&
                          format(new Date(qualityDetailDate), "yyyy-MM-dd"),
                      })}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={this.closeQualityDetail}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {qualityDetailLoading && (
                      <ReactLoading
                        className="loading"
                        type="spin"
                        color="blue"
                      />
                    )}
                    {!qualityDetailLoading && qualityDetails.length === 0 && (
                      <p className="mb-0">
                        {t("planQualityStatics.noQualityData")}
                      </p>
                    )}
                    {!qualityDetailLoading && qualityDetails.length > 0 && (
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>{t("planQualityStatics.columns.line")}</th>
                            <th>{t("planQualityStatics.columns.model")}</th>
                            <th>{t("planQualityStatics.columns.produced")}</th>
                            <th>{t("planQualityStatics.columns.defects")}</th>
                            <th>{t("planQualityStatics.columns.ftq")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualityDetails.map((d) => (
                            <tr key={d.lineId + "-" + d.modelId}>
                              <td>{d.lineName}</td>
                              <td>{d.modelName}</td>
                              <td>{d.produced}</td>
                              <td>{d.defectCount}</td>
                              <td>{d.ftq}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={this.closeQualityDetail}
                    >
                      {t("common:buttons.close")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show"></div>
          </>
        )}
      </div>
    );
  }
}

export default withTranslation(["statics", "common"])(PlanQualityStatics);
