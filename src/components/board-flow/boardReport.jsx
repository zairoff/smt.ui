import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  addBoardReport,
  deleteBoardReport,
  getBoardReport,
  getBoardReportByReaderAndDate,
} from "../../services/board-flow/boardReportService";
import { getQrReaders } from "../../services/board-flow/qrReaderService";
import BoardReportTable from "../tables/board-flow/boardReportTable";

/*
    public enum BoardPassStatus
    {
        Passed = 0,
        MissingPreviousPass = 1,
        Deleted = 2,
    }
*/
class BoardReport extends Form {
  barcodeRef = React.createRef();

  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { qrCode: "" },
    data: [],
    errors: {},
    loading: true,
    selectedReader: "",
    readers: [],
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  async componentDidMount() {
    try {
      const { data: readers } = await getQrReaders();
      console.log(readers);
      this.setState({ readers });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleDelete = async ({ id }) => {
    this.setState({ loading: true });
    const { data, fields } = this.state;
    try {
      await deleteBoardReport(id);
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: imports } = await getBoardReportByReaderAndDate(
        fields.qrReaderId,
        today
      );
      data = imports.map((obj, index) => ({
        ...obj,
        index: index + 1,
      }));
      this.setState({ loading: false, data });
    } catch (ex) {
      this.setState({ data });
      this.catchExceptionMessage(ex, "product");
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
      });
      const { fields, selectedReader } = this.state;
      const qrCode = e.target.value;

      try {
        await addBoardReport({
          qrCode: qrCode,
          qrReaderId: selectedReader,
        });

        const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const { data } = await getBoardReport(fields.qrReaderId, today);

        const imports = data.map((obj, index) => ({
          ...obj,
          index: index + 1,
        }));

        if (Object.keys(imports).length > 0) {
          this.setState({
            fields: {
              qrCode: "",
            },
            data: imports,
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

  handleSelectChange = async ({ target }) => {
    const { value } = target;
    console.log(target);
    if (!value) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await getBoardReportByReaderAndDate(value, today);
    // TODO: Need to find other way. Here extra server call occuring
    this.setState({
      selectedReader: value,
      data,
    });
  };

  render() {
    const { data, sortColumn, loading, fields, errors, readers } = this.state;

    console.log(data);
    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col">
          {this.renderSelect(
            "Readers",
            readers,
            errors.readers,
            this.handleSelectChange
          )}
          <p className="mt-2"> </p>
        </div>
        <div className="col">
          {this.renderInput(
            "qrCode",
            "",
            "",
            fields.qrCode,
            this.handleInputChange,
            errors.qrCode,
            true,
            "text",
            this.barcodeRef,
            false,
            this.handleImportKeyPress
          )}
          <p className="mt-2"> </p>
        </div>
        <BoardReportTable
          rows={data}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
        />
      </div>
    );
  }
}

export default BoardReport;
