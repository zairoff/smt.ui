import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "./form";
import ModelTable from "../tables/modelTable";
import { paginate } from "../../utils/paginate";
import Pagination from "../common/pagination";
import { addModel, deleteModel, getModels } from "../../services/modelService";
import { toast } from "react-toastify";
import { getProducts } from "../../services/productService";

class ModelForm extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: {
      model: "",
      size: "",
    },
    currentPage: 1,
    selectedItem: { id: "", value: "" },
    pageSize: 15,
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data } = await getModels();
      this.setState({ data, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.message);
    }
  }

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deleteModel(id);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize == 0;
  }

  doSubmit = async () => {
    const { data, fields } = this.state;
    this.setState({ loading: true });
    try {
      const { data: result } = await addModel({
        size: fields.size,
        name: fields.model,
      });
      const newData = [result, ...data];
      this.setState({
        data: newData,
        loading: false,
        fields: { model: "", size: "" },
      });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.response.data.message);
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  render() {
    const {
      data: allData,
      pageSize,
      currentPage,
      sortColumn,
      fields,
      errors,
      loading,
    } = this.state;

    const itemsCount = allData.length;
    const sortedData = _.orderBy(
      allData,
      [sortColumn.path],
      [sortColumn.order]
    );

    const data = paginate(sortedData, currentPage, pageSize);

    return (
      <form className="m-2 row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <ModelTable
            rows={data}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={itemsCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-5">
          {this.renderInput(
            "model",
            "Model",
            "",
            fields.model,
            this.handleInputChange,
            errors.model,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "size",
            "Size",
            "",
            fields.size,
            this.handleInputChange,
            errors.size,
            true,
            ""
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
        </div>
      </form>
    );
  }
}

export default ModelForm;
