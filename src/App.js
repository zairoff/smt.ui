import React, { Component } from "react";
import NavBar from "./components/navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import ProductForm from "./components/forms/productForm";
import ModelForm from "./components/forms/modelForm";
import BrandForm from "./components/forms/brandForm";
import ProductBrandForm from "./components/forms/productBrandForm";
import Login from "./components/forms/login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./components/forms/register";
import jwtDecode from "jwt-decode";
import DefectForm from "./components/forms/defectForm";
import LineForm from "./components/forms/lineForm";
import LineDefectForm from "./components/forms/lineDefectForm";
import DepartmentForm from "./components/forms/departmentForm";
import EmployeeDashboard from "./components/forms/employee/employeeDashboard";
import EmployeeAdd from "./components/forms/employee/employeeAdd";
import Report from "./components/reports/report";
import EmployeeEdit from "./components/forms/employee/employeeEdit";
import MachineForm from "./components/forms/machineForm";
import MachineRepairForm from "./components/forms/machineRepairForm";
import PcbRepairerForm from "./components/forms/pcbRepairerForm";
import MachineRepairerForm from "./components/forms/machineRepairerForm";
import MachineDashborad from "./components/machineDashboard";
import MachineHistory from "./components/machineHistory";
import PcbReport from "./components/reports/pcbReport";
import StaticsForm from "./components/statics/staticsForm";
import Logout from "./components/forms/logout";
import FtqReport from "./components/reports/ftqReport";
import Repair from "./components/reports/repair";
import Plan from "./components/forms/planForm";
import PlanActivityForm from "./components/forms/PlanActivityForm";
import PlanActivityEditForm from "./components/forms/planActivityEditForm";
import DetailedReport from "./components/reports/detailedReport";
import GroupByStaticsForm from "./components/statics/groupByStaticsForm";
import RepairHistory from "./components/reports/repairHistory";
import ModelEditForm from "./components/forms/modelEditForm";

class App extends Component {
  state = {};

  componentDidMount() {
    try {
      const jwt = localStorage.getItem("token");
      const user = jwtDecode(jwt);
      this.setState({ user });
    } catch (ex) {}
  }

  render() {
    const { user } = this.state;
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={user} />
        <main className="container mt-4">
          <Routes>
            {user ? (
              <>
                <Route path="/product" element={<ProductForm />} />
                <Route path="/brand" element={<BrandForm />} />
                <Route path="/productBrand" element={<ProductBrandForm />} />
                <Route path="/model" element={<ModelForm />} />
                <Route path="/model-edit/:id" element={<ModelEditForm />} />
                <Route path="/defect" element={<DefectForm />} />
                <Route path="/line" element={<LineForm />} />
                <Route path="/lineDefect" element={<LineDefectForm />} />
                <Route path="/department" element={<DepartmentForm />} />
                <Route
                  path="/employee-dashboard"
                  element={<EmployeeDashboard />}
                />
                <Route path="/employee-add" element={<EmployeeAdd />} />
                <Route
                  path="/employee-edit/:empId"
                  element={<EmployeeEdit />}
                />
                <Route path="/pcb-repairer" element={<PcbRepairerForm />} />
                <Route
                  path="/machine-repairer"
                  element={<MachineRepairerForm />}
                />
                <Route path="/machine" element={<MachineForm />} />

                <Route path="/logout" element={<Logout />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/ftq" />} />
            )}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/report" element={<Report />} />
            <Route path="/pcb-repair" element={<Repair />} />
            <Route path="/machine-repair" element={<MachineRepairForm />} />
            <Route path="/machine-dashboard" element={<MachineDashborad />} />
            <Route path="/pcb-report" element={<PcbReport />} />
            <Route path="/statics" element={<GroupByStaticsForm />} />
            <Route path="/dashboard" element={<StaticsForm />} />
            <Route path="/ftq" element={<FtqReport />} />
            <Route path="/plan" element={<Plan />} />
            <Route
              path="/machine-history/:machineId"
              element={<MachineHistory />}
            />
            <Route path="/plan-activity" element={<PlanActivityForm />} />
            <Route
              path="/plan-activity/:id"
              element={<PlanActivityEditForm />}
            />
            <Route path="/detailed" element={<DetailedReport />} />
            <Route path="/repair-history" element={<RepairHistory />} />
          </Routes>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
