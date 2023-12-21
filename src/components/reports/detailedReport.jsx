import { Component } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getReportsBy,
  getReportsByLineAndDefect,
  getReportsByLineAndStatus,
} from "../../services/reportService";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import DetailedDefectTable from "../tables/detailedDefectTable";
import _ from "lodash";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";

class DetailedReport extends Component {
  state = {
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 35,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { line, from, to, defectName, display, shift } = data;
    this.setState({ loading: true });
    try {
      if (display === "all") {
        const { data } = await getReportsBy(-1, line, shift, from, to);
        this.setState({ loading: false, data });
      } else if (display == "defect") {
        const { data } = await getReportsByLineAndDefect(
          line,
          defectName,
          shift,
          from,
          to
        );
        this.setState({ loading: false, data });
      }
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
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

  render() {
    const {
      data: allRows,
      pageSize,
      currentPage,
      sortColumn,
      loading,
      status,
    } = this.state;
    const sortedRows = _.orderBy(
      allRows,
      [sortColumn.path],
      [sortColumn.order]
    );

    const rows = paginate(sortedRows, currentPage, pageSize);

    const { data } = this.props.location.state;
    const { line, from, to, shift } = data;
    return (
      <>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <Link
          to={{
            pathname: "/ftq",
          }}
          state={{
            data: {
              from: from,
              to: to,
              line: line,
              shift: shift,
            },
          }}
          className="btn btn-success mt-2 mb-2"
        >
          BACK
        </Link>
        <DetailedDefectTable
          rows={rows}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          status={status}
        />
        <Pagination
          itemsCount={allRows.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={this.handlePageChange}
        />
      </>
    );
  }
}

export default () => (
  <DetailedReport params={useParams()} location={useLocation()} />
);
