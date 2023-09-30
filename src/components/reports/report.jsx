import React from "react";
import { getLines } from "../../services/lineService";
import { getModels } from "../../services/modelService";
import Form from "../forms/form";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import ButtonBadge from "../common/buttonBadge";
import { getLineDefectByLineId } from "../../services/lineDefectService";
import {
  addReport,
  deleteReport,
  getReportByModelIdAndLineId,
} from "../../services/reportService";
import ReportTable from "../tables/reportTable";
import Pagination from "../common/pagination";
import _ from "lodash";
import { paginate } from "../../utils/paginate";
import { format } from "date-fns";

class Report extends Form {
  barcodeRef = React.createRef();

  state = {
    models: [],
    lines: [],
    defects: [],
    selectedItem: { modelId: "", lineId: "" },
    data: [],
    loading: true,
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 15,
    shift: "",
    daynight: [],
  };

  async componentDidMount() {
    try {
      const { data: models } = await getModels();
      const { data: lines } = await getLines();
      this.setState({ models, lines });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSelectChange = async ({ target }) => {
    const { name, value: id } = target;
    this.setState({ loading: true });
    try {
      switch (name) {
        case "Model":
          const { selectedItem } = this.state;

          selectedItem.modelId = id;

          this.setState({
            selectedItem,
            loading: false,
          });
          break;
        case "Line":
          {
            const { selectedItem } = this.state;
            selectedItem.lineId = id;

            if (!selectedItem.modelId) return;

            const { data: lineDefects } = await getLineDefectByLineId(
              selectedItem.lineId
            );
            const defects = lineDefects.map((ld) => ld.defect);

            const daynight = [
              { id: "Den", name: "Den" },
              { id: "Noch", name: "Noch" },
            ];

            this.setState({
              defects,
              selectedItem,
              daynight,
              loading: false,
            });
          }
          break;
        case "Smena":
          {
            const { selectedItem } = this.state;
            if (!selectedItem.modelId || !selectedItem.lineId) return;

            const { data } = await getReportByModelIdAndLineId(
              selectedItem.modelId,
              selectedItem.lineId,
              id,
              format(new Date(), "yyyy-MM-dd HH:mm:ss")
            );

            this.setState({
              data,
              shift: id,
              loading: false,
            });
          }

          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleButtonClick = async (defect) => {
    const { selectedItem, data, shift } = this.state;
    const { modelId, lineId } = selectedItem;

    if (Object.values(selectedItem).every((x) => x === null || x === "")) {
      toast.warning("Check model and line are choosen");
      return;
    }

    const report = {
      lineId: lineId,
      defectId: defect,
      modelId: modelId,
      shift: shift,
    };

    try {
      await addReport(report);
      const { data } = await getReportByModelIdAndLineId(
        modelId,
        lineId,
        shift,
        format(new Date(), "yyyy-MM-dd HH:mm:ss")
      );

      this.setState({ data });
    } catch (ex) {
      this.catchExceptionMessage(ex, "model");

      if (ex.response && ex.response.status == 409) {
        this.setState({ data });
      } else {
        this.setState({
          data,
        });
      }
    }
  };

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

  handleDelete = async (report) => {
    const clone = [...this.state.data];
    const filtered = clone.filter((r) => r.id != report.id);
    this.setState({ data: filtered });
    try {
      await deleteReport(report.id);
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ data: clone });
    }
  };

  render() {
    const {
      models,
      defects,
      lines,
      data,
      sortColumn,
      currentPage,
      pageSize,
      loading,
      daynight,
    } = this.state;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <React.Fragment>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="row mt-4">
          <div className="col">
            {this.renderSelect("Model", models, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Line", lines, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Smena", daynight, "", this.handleSelectChange)}
          </div>
          <div className="row mt-4">
            <div className="col">
              {defects.map((defect) => (
                <ButtonBadge
                  onClick={this.handleButtonClick}
                  key={defect.id}
                  value={defect.name}
                  id={defect.id}
                  reports={data}
                ></ButtonBadge>
              ))}
            </div>
            <div className="col">
              <ReportTable
                rows={rows}
                onSort={this.handleSort}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
              />
              <Pagination
                itemsCount={data.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Report;
