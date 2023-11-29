import { Component } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import _ from "lodash";
import DetailedReadyProductReportTable from "../tables/detailedReadyProductReportTable";
import { getTransactionBySapCodeDateRange } from "../../services/readyProductTransactionService";

class DetailedReadyProductReport extends Component {
  state = {
    sortColumn: { path: "", order: "asc" },
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { sapCode, from, to, transactionType } = data;
    this.setState({ loading: true });
    try {
      const { data } = await getTransactionBySapCodeDateRange(
        sapCode,
        from,
        to,
        transactionType
      );
      this.setState({ loading: false, data });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  render() {
    const { data, sortColumn, loading } = this.state;

    return (
      <>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <DetailedReadyProductReportTable
          rows={data}
          onSort={this.handleSort}
          sortColumn={sortColumn}
        />
      </>
    );
  }
}

export default () => (
  <DetailedReadyProductReport params={useParams()} location={useLocation()} />
);
