import { Component } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import _ from "lodash";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import RepairHistoryTable from "../tables/repairHistoryTable";
import { format } from "date-fns";

class RepairHistory extends Component {
  state = {
    sortColumn: { path: "", order: "asc" },
    currentPage: 1,
    pageSize: 25,
    data: [],
    errors: {},
    loading: true,
    status: false,
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { reports } = data;
    const filtered = reports.map((d) => ({
      id: d.id,
      barcode: d.barcode,
      product: d.model.productBrand.product.name,
      brand: d.model.productBrand.brand.name,
      model: d.model.name,
      line: d.line.name,
      defect: d.defect.name,
      action: d.action,
      condition: d.condition,
      employee: d.employee,
      createdDate: format(Date.parse(d.createdDate), "yyyy-MM-dd HH:mm:ss"),
      updatedDate: format(Date.parse(d.updatedDate), "yyyy-MM-dd HH:mm:ss"),
    }));
    this.setState({ loading: false, data: filtered });
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
    return (
      <>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <RepairHistoryTable
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
        <Link
          to={{
            pathname: "/pcb-repair",
          }}
          className="btn btn-success mt-2 mb-2"
        >
          BACK
        </Link>
      </>
    );
  }
}

export default () => (
  <RepairHistory params={useParams()} location={useLocation()} />
);
