import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { getModelBySapCode } from "../../services/modelService";
import ReadyProductImportTable from "../tables/readyProductImportTable";
import {
  deleteReadyProductTransaction,
  getTransactionByDate,
  importReadyProductTransaction,
} from "../../services/readyProductTransactionService";

/**
 *  public enum TransactionType
    {
        All = 0,
        Import = 1,
        Export = 2,
        Deleted = 3,
    }
 */

class ReadyProductImportForm extends Form {
  barcodeRef = React.createRef();

  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { import: "" },
    imports: [],
    errors: {},
    loading: true,
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  async componentDidMount() {
    try {
      const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data: imports } = await getTransactionByDate(today, 1); // 1 - is import
      this.setState({ imports });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleDelete = async ({ id }) => {
    const { imports } = this.state;
    this.setState({ loading: true });

    try {
      await deleteReadyProductTransaction(id);
      const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data: imports } = await getTransactionByDate(today, 1);
      this.setState({ loading: false, imports });
    } catch (ex) {
      this.setState({ imports });
      this.catchExceptionMessage(ex, "product");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  handleImportKeyPress = async (e) => {
    const { fields } = this.state;

    if (e.key === "Enter") {
      this.setState({
        loading: true,
        fields: { import: "" },
      });
      const barcode = e.target.value;

      try {
        const indexOf = barcode.indexOf("-");
        const sapCode = barcode.substring(0, indexOf);
        const count = barcode.substring(indexOf + 4, barcode.length);

        if (count === "" || sapCode === "") {
          return;
        }

        const { data: model } = await getModelBySapCode(sapCode);
        if (model === "" || model === undefined) {
          return;
        }
        const readyProductCreate = {
          modelId: model.id,
          count,
        };
        await importReadyProductTransaction(readyProductCreate);

        const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const { data: imports } = await getTransactionByDate(today, 1);

        console.log("imm", imports);
        if (Object.keys(imports).length > 0) {
          this.setState({
            fields: {
              import: "",
            },
            imports,
            loading: false,
          });
        }
      } catch (ex) {
        console.log(ex);
        toast.error(ex.response.data.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  render() {
    const { imports, sortColumn, loading, fields, errors } = this.state;

    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col">
          {this.renderInput(
            "import",
            "",
            "",
            fields.import,
            this.handleInputChange,
            errors.import,
            true,
            "text",
            this.barcodeRef,
            false,
            this.handleImportKeyPress
          )}
          <p className="mt-2"> </p>
          <ReadyProductImportTable
            rows={imports}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
        </div>
      </div>
    );
  }
}

export default ReadyProductImportForm;
