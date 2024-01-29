import React from "react";
import { toast } from "react-toastify";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import {
  exportReturnedProduct,
  getBufferState,
  getRepairState,
  getStoreState,
  getUtilizeState,
} from "../../services/returnedProductTransactionService";
import ReturnedProductExportTable from "../tables/ReturnedProductExportTable";

/**
    public enum ReturnedProductTransactionType
    {
        All = 0,
        ImportFromFactoryToBuffer = 1,
        ExportFromRepairToStore = 2,
        ExportFromRepairToUtilize = 3,
        ExportFromStoreToFactory = 4,
        ExportFromBufferToRepair = 5,
        ExportFromStoreToUtilize = 6,
        Deleted = 7,
    }
 */

class ReturnProductExport extends Form {
  state = {
    errors: {},
    data: [],
    loading: false,
    sortColumn: { path: "", order: "asc" },
    authorized: false,
    filters: [
      { id: 2, name: "REMONTDAN CHIQISH (OMBORGA)" },
      { id: 3, name: "REMONTDAN CHIQISH (OMBOR, UTILIZATSIYAGA)" },
      { id: 4, name: "OMBORDAN CHIQISH (ZAVODGA)" },
      { id: 6, name: "OMBORDAN CHIQISH (UTILIZATSIYAGA)" },
      { id: 5, name: "BUFFERDAN CHIQISH (REMONTGA)" },
    ],
    selectedTransactionType: "",
  };

  async componentDidMount() {
    const { user } = this.props;
    this.setState({ authorized: user != null });
  }

  handleDelete = async (transaction) => {
    try {
      const { selectedTransactionType } = this.state;
      this.setState({ loading: true });
      const returnedProductTransaction = {
        modelId: transaction.model.id,
        count: transaction.count,
        TransactionType: parseInt(selectedTransactionType),
      };
      await exportReturnedProduct(returnedProductTransaction);
      const { data } = await this.loadDataAsync(
        parseInt(selectedTransactionType)
      );
      this.setState({ loading: false, data });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.response.data.title);
    }
  };

  handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    this.loadDataAsync(id);
  };

  async loadDataAsync(id) {
    this.setState({ loading: true });

    try {
      switch (id) {
        case "2":
        case "3": {
          const { data } = await getRepairState();

          this.setState({ data, selectedTransactionType: id });
          break;
        }
        case "4": {
          const { data } = await getStoreState();

          this.setState({ data, selectedTransactionType: id });
          break;
        }
        case "5": {
          const { data } = await getBufferState();

          this.setState({ data, selectedTransactionType: id });
          break;
        }
        case "6": {
          const { data } = await getUtilizeState();

          this.setState({ data, selectedTransactionType: id });
          break;
        }

        default:
          break;
      }
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      data,
      sortColumn,
      loading,
      authorized,
      filters,
      selectedTransactionType,
    } = this.state;

    return (
      <>
        <div className="row mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="col">
            {this.renderSelect("Qaerga?", filters, "", this.handleFilterChange)}
            <p className="mt-2"> </p>
            <ReturnedProductExportTable
              rows={data}
              onSort={this.handleSort}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
              authorized={authorized}
              transactionType={selectedTransactionType}
            />
          </div>
        </div>
      </>
    );
  }
}

export default ReturnProductExport;
