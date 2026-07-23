import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
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
      this.setState({ readers });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleDelete = async ({ id }) => {
    this.setState({ loading: true });
    const { data, selectedReader } = this.state;
    try {
      await deleteBoardReport(id);
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: imports } = await getBoardReportByReaderAndDate(
        selectedReader,
        today
      );
      data = imports.map((obj, index) => ({
        ...obj,
        index: index + 1,
      }));
    } catch (ex) {
      this.setState({ data });
      this.catchExceptionMessage(ex, "product");
    } finally {
      this.setState({ loading: false, data });
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
        const { data } = await getBoardReportByReaderAndDate(
          selectedReader,
          today
        );

        const imports = data.map((obj, index) => ({
          ...obj,
          index: index + 1,
        }));

        if (Object.keys(imports).length > 0) {
          this.setState({
            data: imports,
          });
        }
      } catch (ex) {
        toast.error(ex.response.data.message);
      } finally {
        this.setState({
          loading: false,
          fields: {
            qrCode: "",
          },
        });
      }
    }
  };

  handleSelectChange = async ({ target }) => {
    const { value } = target;
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
            this.handleSelectChange,
            undefined,
            undefined,
            this.props.t("boardReport.readersLabel")
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

export default withTranslation(["boardFlow", "common"])(BoardReport);
