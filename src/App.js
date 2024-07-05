import React, { Component } from "react";
import NavBar from "./components/navbar";
import { Route, Routes } from "react-router-dom";
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
import ReadyProductImportForm from "./components/ready-product/readyProductImportForm";
import ReadyProductExportForm from "./components/ready-product/readyProductExportForm";
import ReadyProducExportDetailForm from "./components/ready-product/readyProducExportDetailForm";
import ReadyProductReport from "./components/ready-product/readyProductReport";
import DetailedReadyProductReport from "./components/ready-product/detailedReadyProductReport";
import PlanActivityReport from "./components/forms/planActivityReport";
import ReturnProductImport from "./components/return-product/returnProductImport";
import ReturnProductExport from "./components/return-product/returnProductExport";
import ReturnProducExportDetail from "./components/return-product/returnProducExportDetail";
import ReturnProductTransactions from "./components/return-product/returnProductTransactions";
import ReturnProductReport from "./components/return-product/returnProductReport";
import ReadyProductTransactions from "./components/ready-product/readyProductTransactions";
import ReadyProductTransactionsDetailed from "./components/ready-product/readyProductTransactionsDetailed";
import HourlyPlan from "./components/forms/hourlyPlan";
import ComponentBulkImport from "./components/store/componentBulkImport";
import ComponentPrint from "./components/store/componentPrint";
import ComponentAdd from "./components/store/componentAdd";

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
    const authorized = user !== "" && user != undefined;
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={user} />
        <main className="container mt-4">
          <Routes>
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
              <Route path="/employee-edit/:empId" element={<EmployeeEdit />} />
              <Route path="/pcb-repairer" element={<PcbRepairerForm />} />
              <Route
                path="/machine-repairer"
                element={<MachineRepairerForm />}
              />
              <Route path="/machine" element={<MachineForm />} />

              <Route path="/report" element={<Report />} />
              <Route path="/pcb-repair" element={<Repair />} />
              <Route path="/machine-repair" element={<MachineRepairForm />} />
              <Route path="/machine-dashboard" element={<MachineDashborad />} />
              <Route path="/pcb-report" element={<PcbReport />} />
              <Route path="/statics" element={<GroupByStaticsForm />} />
              <Route path="/dashboard" element={<StaticsForm />} />
              <Route path="/ftq" element={<FtqReport />} />
              <Route path="*" element={<FtqReport />} />
              <Route path="/plan" element={<Plan />} />
              <Route
                path="/machine-history/:machineId"
                element={<MachineHistory />}
              />
              <Route path="/plan-activity" element={<PlanActivityForm />} />
              <Route
                path="/plan-activity-report"
                element={<PlanActivityReport />}
              />
              <Route
                path="/plan-activity/:id"
                element={<PlanActivityEditForm />}
              />
              <Route path="/detailed" element={<DetailedReport />} />
              <Route path="/repair-history" element={<RepairHistory />} />
              <Route
                path="/ready-product-import"
                element={
                  <ReadyProductImportForm user={user} authorized={authorized} />
                }
              />
              <Route
                path="/ready-product-export"
                element={
                  <ReadyProductExportForm user={user} authorized={authorized} />
                }
              />
              <Route
                path="/ready-product-export/:id"
                element={<ReadyProducExportDetailForm />}
              />
              <Route
                path="/ready-product-report"
                element={<ReadyProductReport />}
              />
              <Route
                path="/ready-product-detailed"
                element={<DetailedReadyProductReport />}
              />

              <Route
                path="/ready-product-transactions"
                element={<ReadyProductTransactions user={user} />}
              />

              <Route
                path="/ready-product-transactions/:id"
                element={<ReadyProductTransactionsDetailed />}
              />

              <Route
                path="/returned-product-import"
                element={<ReturnProductImport user={user} />}
              />

              <Route
                path="/returned-product-export"
                element={<ReturnProductExport user={user} />}
              />

              <Route
                path="/returned-product-export/:id"
                element={<ReturnProducExportDetail />}
              />

              <Route
                path="/returned-product-transactions"
                element={<ReturnProductTransactions user={user} />}
              />

              <Route
                path="/returned-product-report"
                element={<ReturnProductReport />}
              />

              <Route path="/component" element={<ComponentAdd />} />

              <Route
                path="/component-import"
                element={<ComponentBulkImport />}
              />

              <Route path="/component-print" element={<ComponentPrint />} />

              <Route path="/plan-hourly" element={<HourlyPlan />} />

              <Route path="/logout" element={<Logout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          </Routes>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
