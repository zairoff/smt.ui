import React from "react";
import Form from "../form";
import { withTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import Department from "../../common/department";
import { getDepartmentByHierarchyId } from "../../../services/departmentService";
import { toast } from "react-toastify";
import { addEmployee } from "../../../services/employeeService";
import { addFile } from "../../../services/fileService";
import config from "../../../config.json";

class EmployeeAdd extends Form {
  inputFile = React.createRef();
  state = {
    loading: false,
    imageFileName: "",
    fields: {
      name: "",
      department: "",
      position: "",
      phone: "",
      details: "",
      birthday: "",
    },
    departmentId: "",
    errors: {},
    departments: [],
  };

  async componentDidMount() {
    try {
      const { data: departments } = await getDepartmentByHierarchyId("/");
      this.setState({ departments });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleFileUpload = async (e) => {
    const { files } = e.target;

    if (files && files.length) {
      try {
        this.setState({ loading: true });
        const formData = new FormData();
        formData.append("file", files[0]);
        const { data } = await addFile(formData);
        this.setState({ imageFileName: data });
      } catch (ex) {
        toast.error(ex.response.data.message);
        this.setState({ imageFileName: "" });
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleImageClick = () => {
    this.inputFile.current.click();
  };

  handleDepartmentSelect = ({ id, departmentId, name }) => {
    let fields = { ...this.state.fields };
    const { departments } = this.state;

    const filter = departmentId.replace(id + "/", "");
    const department = departments.filter((d) => d.departmentId === filter);

    fields.department = department[0].name;
    fields.position = name;
    this.setState({ fields, departmentId: id });
  };

  doSubmit = async () => {
    const { imageFileName, departmentId, fields } = this.state;
    const { name, phone, details, birthday } = fields;

    if (!imageFileName) {
      toast.warning(this.props.t("forms:employeeAdd.chooseImageWarning"));
      return;
    }

    const employee = {
      departmentId,
      FullName: name,
      phone,
      details,
      ImagePath: imageFileName,
      birthday,
      IsActive: true,
    };

    this.setState({ loading: true });

    try {
      await addEmployee(employee);
      toast.info(this.props.t("forms:employee.successMessage"));
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({
        loading: false,
        fields: {
          name: "",
          birthday: "",
          phone: "",
          address: "",
          details: "",
          department: "",
          position: "",
          passport: "",
          imageFileName: "",
        },
      });
    }
  };

  render() {
    const { t } = this.props;
    const { loading, imageFileName, fields, errors, departments } = this.state;
    return (
      <form
        className="row "
        encType="multipart/form-data"
        onSubmit={this.handleSubmit}
      >
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col mt-4">
          <div className="col-5 mt-4">
            <input
              style={{ display: "none" }}
              // accept=".zip,.rar"
              ref={this.inputFile}
              onChange={this.handleFileUpload}
              type="file"
            />
            <img
              src={
                imageFileName
                  ? config.fileUrl + imageFileName
                  : require("../../../assets/images/staff.jpg")
              }
              style={{ height: "200px", width: "200px", objectFit: "cover" }}
              onClick={this.handleImageClick}
            />
          </div>
        </div>
        <div className="col">
          {this.renderInput(
            "name",
            t("forms:employee.fullName"),
            "",
            fields.name,
            this.handleInputChange,
            errors.name,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "department",
            t("forms:employee.department"),
            "",
            fields.department,
            this.handleInputChange,
            errors.department,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "position",
            t("forms:employee.position"),
            "",
            fields.position,
            this.handleInputChange,
            errors.position,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "phone",
            t("forms:employee.phone"),
            "",
            fields.phone,
            this.handleInputChange,
            errors.phone,
            true,
            "number"
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "birthday",
            t("forms:employee.birthday"),
            "",
            fields.birthday,
            this.handleInputChange,
            "",
            true,
            "date"
          )}
          <p className="mt-2"> </p>
          {this.renderTextArea(
            "details",
            t("forms:employee.details"),
            fields.details,
            this.handleInputChange
          )}
          <p className="mt-2"> </p>
          {this.renderButton(t("common:buttons.save"))}
          <p className="mb-2"> </p>
        </div>

        <div className="col m-4">
          <Department
            className="m-2"
            data={departments}
            onClick={this.handleDepartmentSelect}
          />
        </div>
      </form>
    );
  }
}

export default withTranslation(["forms", "common"])(EmployeeAdd);
