import React, { Component } from "react";
import NavBar from "./components/navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import ModelForm from "./components/forms/modelForm";
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
import PlannerForm from "./components/forms/plannerForm";

class App extends Component {
  state = {};

  componentDidMount() {
    try {
      const jwt = localStorage.getItem("token");
      const user = jwtDecode(jwt);
      this.setState({ user });
    } catch (ex) { }
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
                <Route path="/model" element={<ModelForm />} />
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
              <Route path="*" element={<Navigate to="/dashboard" />} />
            )}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/report" element={<Report />} />
            <Route path="/machine-repair" element={<MachineRepairForm />} />
            <Route path="/machine-dashboard" element={<MachineDashborad />} />
            <Route path="/pcb-report" element={<PcbReport />} />
            <Route path="/statics" element={<StaticsForm />} />
            <Route path="/dashboard" element={<StaticsForm />} />
            <Route path="/ftq" element={<FtqReport />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/planner" element={<PlannerForm />} />
            <Route
              path="/machine-history/:machineId"
              element={<MachineHistory />}
            />
          </Routes>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
