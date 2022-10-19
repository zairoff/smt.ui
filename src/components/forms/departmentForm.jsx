import React from "react";
import Form from "./form";
import ReactLoading from "react-loading";
import Department from "../common/department";
import { toast } from "react-toastify";
import {
  addDepartment,
  deleteDepartment,
  getDepartmentByHierarchyId,
  updateDepartment,
} from "../../services/departmentService";

class DepartmentForm extends Form {
  state = {
    data: [],
    fields: { department: "" },
    errors: {},
    loading: true,
    selected: {},
  };

  async componentDidMount() {
    try {
      const { data } = await getDepartmentByHierarchyId("/");
      this.setState({ data });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  doSubmit = async () => {
    const { fields, selected, data } = this.state;
    if (data.length > 0 && Object.keys(selected).length === 0) {
      toast.warning("Select deparmtnet first");
      return;
    }
    this.setState({ loading: true });
    try {
      await addDepartment({
        departmentId: selected.departmentId,
        name: fields.department,
      });
      fields.department = "";
      const { data } = await getDepartmentByHierarchyId("/", 0);
      this.setState({ data, fields, selected: {}, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      this.catchExceptionMessage(ex, "department");
    }
  };

  handleDelete = async () => {
    this.setState({ loading: true });
    try {
      await deleteDepartment(this.state.selected.id);
      const { data } = await getDepartmentByHierarchyId("/", 0);
      this.setState({ data, selected: {}, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      this.catchExceptionMessage(ex, "department");
    }
  };

  handleUpdate = async () => {
    const { fields, selected, data } = this.state;
    if (data.length > 0 && Object.keys(selected).length === 0) {
      toast.warning("Select deparmtnet first");
      return;
    }
    this.setState({ loading: true });
    try {
      await updateDepartment(selected.id, {
        name: fields.department,
      });
      fields.department = "";
      const { data } = await getDepartmentByHierarchyId("/", 0);
      this.setState({ data, selected: {}, fields, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
      this.catchExceptionMessage(ex, "department");
    }
  };

  handleDepartmentSelect = (selected) => {
    console.log("selected:", selected);
    this.setState({ selected });
  };

  render() {
    const { fields, data, errors, loading } = this.state;
    return (
      <form className="container m-2 row" onSubmit={this.handleSubmit}>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="col mt-4">
          <Department data={data} onClick={this.handleDepartmentSelect} />
        </div>
        <div className="col m-2">
          {this.renderInput(
            "department",
            "",
            "",
            fields.department,
            this.handleInputChange,
            errors.department,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save", "submit")}
          <p className="mt-2"> </p>
          {this.renderButton(
            "Update",
            "button",
            this.handleUpdate,
            "btn btn-secondary btn-block btn-lg w-100"
          )}
          <p className="mt-2"> </p>
          {this.renderButton(
            "Delete",
            "button",
            this.handleDelete,
            "btn btn-danger btn-block btn-lg w-100"
          )}
        </div>
      </form>
    );
  }
}

export default DepartmentForm;
