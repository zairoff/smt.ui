import React from "react";
import Form from "../form";
import ReactLoading from "react-loading";
import Department from "../../common/department";
import { toast } from "react-toastify";
import { updateEmployee } from "../../../services/employeeService";
import { useParams, useLocation } from "react-router-dom";
import config from "../../../config.json";
import { addFile } from "../../../services/fileService";
import { getDepartmentByHierarchyId } from "../../../services/departmentService";

class EmployeeEdit extends Form {
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
    },
    departmentId: "",
    employeeId: "",
    errors: {},
    departments: [],
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { id, fullName, phone, details, imageUrl } = data;

    const fields = {
      name: fullName,
      phone,
      details,
      department: "",
      position: "",
    };

    try {
      const { data: departments } = await getDepartmentByHierarchyId("/");
      this.setState({
        departments,
        fields,
        imageFileName: imageUrl,
        employeeId: id,
      });
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
    const { name, phone, details } = fields;

    const employee = {
      imagePath: imageFileName,
      departmentId,
      FullName: name,
      phone,
      details,
      isActive: true,
    };

    this.setState({ loading: true });

    try {
      await updateEmployee(this.props.params.empId, employee);
      toast.info("Success!");
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({
        loading: false,
        fields: {
          name: "",
          phone: "",
          details: "",
          department: "",
          position: "",
          imageFileName: "",
        },
      });
    }
  };

  render() {
    const { loading, imageFileName, fields, errors, departments } = this.state;
    return (
      <form
        className="mt-4 row "
        encType="multipart/form-data"
        onSubmit={this.handleSubmit}
      >
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col mt-4">
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
        <div className="col">
          {this.renderInput(
            "name",
            "Full Name",
            "",
            fields.name,
            this.handleInputChange,
            errors.name,
            true
          )}
          {this.renderInput(
            "department",
            "Department",
            "",
            fields.department,
            this.handleInputChange,
            errors.department,
            true
          )}
          {this.renderInput(
            "position",
            "Position",
            "",
            fields.position,
            this.handleInputChange,
            errors.position,
            true
          )}
          {this.renderInput(
            "phone",
            "Phone",
            "",
            fields.phone,
            this.handleInputChange,
            errors.phone,
            true,
            "number"
          )}
          {this.renderTextArea(
            "details",
            "Additional info",
            fields.details,
            this.handleInputChange
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Save")}
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

export default () => (
  <EmployeeEdit params={useParams()} location={useLocation()} />
);
