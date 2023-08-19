import React from "react";
import { getLines } from "../../services/lineService";
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
import { getModels } from "../../services/modelService";

class Report extends Form {

  state = {
    models: [],
    lines: [],
    defects: [],
    shifts: [{ id: 'day', name: 'day' }, { id: 'night', name: 'night' }],
    selectedItem: { modelId: "", lineId: "", shift: '' },
    data: [],
    loading: false,
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 25,
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
    try {
      switch (name) {
        case "Shift":
          const { selectedItem } = this.state;
          selectedItem.shift = id;
          this.setState({ selectedItem });

          await this.retrieveDataAsync();
          break;
        case "Model":
          {
            const { selectedItem } = this.state;
            selectedItem.modelId = id;

            this.setState({ selectedItem });

            await this.retrieveDataAsync();
          }
          break;
        case "Line":
          {
            const { selectedItem } = this.state;
            selectedItem.lineId = id;

            const { data: lineDefects } = await getLineDefectByLineId(id);
            const defects = lineDefects.map((ld) => ld.defect);

            this.setState({ selectedItem, defects });

            await this.retrieveDataAsync();
          }
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  retrieveDataAsync = async () => {
    const { selectedItem } = this.state;
    const { modelId, lineId, shift } = selectedItem;

    if (modelId !== '' && lineId !== '' && shift !== '') {
      this.setState({
        loading: true,
      });
      const { data } = await getReportByModelIdAndLineId(
        modelId,
        lineId,
        shift,
        format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      );
      this.setState({
        data,
        loading: false,
      });
    }
  }

  handleButtonClick = async (defect) => {
    const { selectedItem, data } = this.state;
    const { modelId, lineId, shift } = selectedItem;

    if (
      shift === '' || shift === null || shift === undefined ||
      Object.values(selectedItem).every((x) => x === null || x === "")
    ) {
      toast.warning("Check model and shift choosen");
      return;
    }

    const report = {
      lineId: lineId,
      defectId: defect,
      modelId: modelId,
      shift: shift
    };

    try {
      await addReport(report);
      const { data } = await getReportByModelIdAndLineId(
        modelId,
        lineId,
        shift,
        format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      );
      this.setState({ data });
    } catch (ex) {
      toast.error(ex.message);

      if (ex.response && ex.response.status == 409) {
        this.setState({ data });
      } else {
        this.setState({
          data
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
      shifts
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
            {this.renderSelect("Shift", shifts, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Model", models, "", this.handleSelectChange)}
          </div>
          <div className="col">
            {this.renderSelect("Line", lines, "", this.handleSelectChange)}
          </div>
          <div className="row mt-4">
            <div className="col">
              <div
                style={{ fontWeight: "bold", width: "150px", height: "20px" }}
              >
                TOTAL:{" "}
                <span className="badge rounded-pill bg-info">
                  {data.length}
                </span>
              </div>
              <p> </p>
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
