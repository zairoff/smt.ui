import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { getModelByBarcode } from "../../services/modelService";
import ReadyProductImportTable from "../tables/readyProductImportTable";
import {
  deleteReturnedProductTransaction,
  getReturnedProductByDate,
  importReturnedProduct,
} from "../../services/returnedProductTransactionService";
import ReturnedProductImportTable from "../tables/ReturnedProductImportTable";

/**
 *  public enum ReturnedProductTransactionType
    {
        All = 0,
        Import = 1,
        ImportFromRepair = 2,
        ImportUtilize = 3,
        Export = 4,
        ExportToRepair = 5,
        ExportUtilize = 6,
        Deleted = 7,
    }
 */

class ReturnProductImport extends Form {
  barcodeRef = React.createRef();

  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { import: "" },
    imports: [],
    errors: {},
    loading: false,
    authorized: false,
    filters: [
      { id: 1, name: "OMBORGA KIRISH (ZAVODDAN)" },
      { id: 2, name: "OMBORGA KIRISH (REMONTDAN)" },
      { id: 3, name: "OMBORGA KIRISH (UTILIZATSIYA)" },
    ],
    selectedImportType: "",
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  async componentDidMount() {
    const { user } = this.props;
    this.setState({ authorized: user != null });
  }

  handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    this.setState({ loading: true });

    try {
      const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReturnedProductByDate(today, id);
      const imports = data.map((obj, index) => ({
        ...obj,
        index: index + 1,
      }));
      this.setState({ imports, selectedImportType: id });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const { imports, selectedImportType } = this.state;
    this.setState({ loading: true });

    try {
      await deleteReturnedProductTransaction(id);
      const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReturnedProductByDate(
        today,
        selectedImportType
      );
      const imports = data.map((obj, index) => ({
        ...obj,
        index: index + 1,
      }));
      this.setState({ loading: false, imports });
    } catch (ex) {
      this.setState({ imports });
      this.catchExceptionMessage(ex, "import");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  handleImportKeyPress = async (e) => {
    if (e.key === "Enter") {
      this.setState({
        loading: true,
        fields: { import: "" },
      });
      const barcode = e.target.value;
      const { selectedImportType } = this.state;
      //3ACOP----10
      try {
        let count = 0;

        const fiveLetterCode = barcode.substring(0, 5);

        if (barcode.length == 14 && !barcode.includes("-")) {
          count = 1;
        }

        if (barcode.includes("-")) {
          const indexOf = barcode.indexOf("-");
          count = barcode.substring(indexOf + 4, barcode.length);
        }

        if (count === "" || count == 0 || fiveLetterCode === "") {
          return;
        }

        const { data: model } = await getModelByBarcode(fiveLetterCode);
        if (model === "" || model === undefined) {
          return;
        }

        const returnedProductCreate = {
          barcode,
          modelId: model.id,
          count,
          TransactionType: parseInt(selectedImportType),
        };

        await importReturnedProduct(returnedProductCreate);

        const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const { data } = await getReturnedProductByDate(
          today,
          selectedImportType
        );

        const imports = data.map((obj, index) => ({
          ...obj,
          index: index + 1,
        }));

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
    const {
      imports,
      sortColumn,
      loading,
      fields,
      errors,
      authorized,
      filters,
    } = this.state;
    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}

        <div className="col">
          {this.renderSelect("Qaerdan?", filters, "", this.handleFilterChange)}
          <p className="mt-2"> </p>
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
          <ReturnedProductImportTable
            rows={imports}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            authorized={authorized}
          />
        </div>
      </div>
    );
  }
}

export default ReturnProductImport;
