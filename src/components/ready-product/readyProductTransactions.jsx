import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import {} from "../../services/returnedProductTransactionService";
import ReturnedProductTransactionsTable from "../tables/ReturnedProductTransactionsTable";
import {
  deleteReadyProductTransaction,
  getTransactionByDateRange,
} from "../../services/readyProductTransactionService";
import ReadyProductTransactionsTable from "../tables/ReadyProductTransactionsTable";

class ReadyProductTransactions extends Form {
  state = {
    data: [],
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: false,
    authorized: false,
    filters: [
      { id: 1, name: "KIRISH" },
      { id: 2, name: "CHIQISH" },
    ],
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "" },
    transactionType: "",
  };

  async componentDidMount() {
    const { user } = this.props;
    this.setState({ authorized: user != null });
  }

  handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    const { from, to } = this.state.fields;

    if (!from || !to || !id) return;

    this.setState({ loading: true });

    try {
      const { data } = await getTransactionByDateRange(from, to, parseInt(id));
      this.setState({
        data,
        loading: false,
        transactionType: id,
        dateFrom: from,
        dateTo: to,
      });
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const { data: oldData, dateFrom, dateTo, transactionType } = this.state;
    try {
      this.setState({ loading: true });
      await deleteReadyProductTransaction(id);
      const { data } = await getTransactionByDateRange(
        dateFrom,
        dateTo,
        parseInt(transactionType)
      );
      this.setState({ loading: false, data });
    } catch (ex) {
      this.setState({ data: oldData });
      this.catchExceptionMessage(ex, "import");
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, filters, sortColumn, fields, loading, authorized } =
      this.state;

    return (
      <>
        <form className="border p-4 mt-2 mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
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
            {
              <div className="col">
                {this.renderSelect(
                  "Filter",
                  filters,
                  "",
                  this.handleFilterChange
                )}
              </div>
            }
            <div className="col-2">
              <p className="mt-4"></p>
              <CSVLink
                className="btn btn-block btn-success btn-lg w-100"
                data={data ?? []}
              >
                Excel
              </CSVLink>
            </div>
          </div>
        </form>

        <ReadyProductTransactionsTable
          rows={data}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
          authorized={authorized}
        />
      </>
    );
  }
}

export default ReadyProductTransactions;
