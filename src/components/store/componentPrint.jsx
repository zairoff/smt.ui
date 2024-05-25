import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { print } from "../../services/printerService";

class ComponentPrint extends Form {
  barcodeRef = React.createRef();

  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { partNumber: "" },
    errors: {},
    loading: false,
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  handleImportKeyPress = async (e) => {
    if (e.key === "Enter") {
      this.setState({
        loading: true,
        fields: { partNumber: "" },
      });

      const barcode = e.target.value;

      try {
        const codes = barcode.split("@");

        if (codes == null || codes == undefined || codes.length < 1) return;

        const printObj = {
          partNumber: codes[0],
        };

        await print(printObj);
      } catch (ex) {
        toast.error(ex.response.data.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  render() {
    const { loading, fields, errors } = this.state;

    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col">
          <button className="btn p-2 btn-success fw-bold">PRINTER</button>
          {this.renderInput(
            "partNumber",
            "",
            "",
            fields.partNumber,
            this.handleInputChange,
            errors.partNumber,
            true,
            "text",
            this.barcodeRef,
            false,
            this.handleImportKeyPress
          )}
        </div>
      </div>
    );
  }
}

export default ComponentPrint;
