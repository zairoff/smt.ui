import React from "react";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import {
  addComponent,
  deleteComponent,
  getPagedComponents,
} from "../../services/componentService";
import ComponentTable from "../tables/componentTable";

class ComponentAdd extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: {
      partNumber: "",
      rCode: "",
      storePlaceNumber: "",
      sapPlace: "",
      placeCode: "",
      specification: "",
    },
    currentPage: 1,
    pageSize: 20,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data } = await getPagedComponents(1, 20);
      this.setState({ data });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  doSubmit = async () => {
    const { data, fields } = this.state;
    this.setState({ loading: true });
    try {
      const component = {
        partNumber: fields.partNumber,
        rCode: fields.rCode,
        storePlaceNumber: fields.storePlaceNumber,
        sapPlace: fields.sapPlace,
        placeCode: fields.placeCode,
        specification: fields.specification,
      };

      const { data: result } = await addComponent(component);

      const newData = [result, ...data];
      this.setState({
        data: newData,
        fields: {
          partNumber: "",
          rCode: "",
          storePlaceNumber: "",
          sapPlace: "",
          placeCode: "",
          specification: "",
        },
      });
    } catch (ex) {
      this.catchExceptionMessage(ex, "partNumber");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deleteComponent(id);
    } catch (ex) {
      this.setState({ data: clone });
      this.catchExceptionMessage(ex, "partNumber");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePageChange = async (page) => {
    const { data } = await getPagedComponents(page, 20);
    this.setState({ currentPage: page, data });
  };

  render() {
    const {
      data: allRows,
      pageSize,
      currentPage,
      sortColumn,
      loading,
      fields,
      errors,
    } = this.state;

    const sortedRows = _.orderBy(
      allRows,
      [sortColumn.path],
      [sortColumn.order]
    );
    const rows = paginate(sortedRows, currentPage, pageSize);
    return (
      <form className="m-2 row " onSubmit={this.handleSubmit}>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col mt-4">
          <ComponentTable
            rows={rows}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
          <Pagination
            itemsCount={allRows.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col mt-5">
          {this.renderInput(
            "partNumber",
            "Part number",
            "",
            fields.partNumber,
            this.handleInputChange,
            errors.partNumber,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "rCode",
            "R code",
            "",
            fields.rCode,
            this.handleInputChange,
            errors.rCode,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "storePlaceNumber",
            "Ombordagi joy nomeri",
            "",
            fields.storePlaceNumber,
            this.handleInputChange,
            errors.storePlaceNumber,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "sapPlace",
            "SAP nomeri",
            "",
            fields.sapPlace,
            this.handleInputChange,
            errors.sapPlace,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "placeCode",
            "Joy kodi",
            "",
            fields.placeCode,
            this.handleInputChange,
            errors.placeCode,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "specification",
            "Specification",
            "",
            fields.specification,
            this.handleInputChange,
            errors.specification,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
      </form>
    );
  }
}

export default ComponentAdd;
