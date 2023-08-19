import _ from "lodash";
import React from "react";
import { getDepartmentByHierarchyId } from "../../services/departmentService";
import { getEmployeeByDepartmentId } from "../../services/employeeService";
import Department from "../common/department";
import MachineRepairerTable from "../tables/machineRepairerTable";
import Form from "./form";
import { toast } from "react-toastify";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import { AddPlanner, deletePlanner, getPlanner, getPlanners } from "../../services/plannerService";
import { getLines } from "../../services/lineService";
import PlannerTable from "../tables/PlannerTable";

class PlannerForm extends Form {
    state = {
        sortColumn: { path: "", order: "asc" },
        currentPage: 1,
        pageSize: 25,
        departments: [],
        selectedItem: { employeeId: "", lineId: "" },
        data: [],
        planners: [],
        errors: {},
        loading: true,
        employeeId: "",
        lines: []
    };

    async componentDidMount() {
        try {
            const { data: departments } = await getDepartmentByHierarchyId("/");
            const { data: lines } = await getLines();
            const { data } = await getPlanners();
            this.setState({ departments, data, lines });
        } catch (ex) {
            toast.error(ex.response.data.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    currentPageCheck(data) {
        const { pageSize } = this.state;

        return data.length % pageSize == 0;
    }

    handleSort = (sortColumn) => {
        this.setState({ sortColumn });
    };

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    handleDepartmentSelect = async (selected) => {
        this.setState({ loading: true });
        try {
            const { data: planners } = await getEmployeeByDepartmentId(
                selected.departmentId,
                true
            );
            this.setState({ planners });
        } catch (ex) {
            toast.error(ex.response.data.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    handleSelectChange = ({ target }) => {
        const { name, value: id } = target;
        switch (name) {
            case "Line":
                {
                    const { selectedItem } = this.state;
                    selectedItem.lineId = id;
                    this.setState({ selectedItem });
                }
                break;
            case "Planners":
                {
                    const { selectedItem } = this.state;
                    selectedItem.employeeId = id;
                    this.setState({ selectedItem });
                }
                break;
        }
    };

    doSubmit = async () => {
        const { selectedItem, data } = this.state;
        try {
            const { data: planner } = await AddPlanner({
                employeeid: selectedItem.employeeId,
                lineId: selectedItem.lineId
            });
            this.setState({ data: [planner, ...data] });
        } catch (ex) {
            toast.error(ex.response.data.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    handleDelete = async ({ id }) => {
        const clone = [...this.state.data];
        const filter = clone.filter((r) => r.id != id);
        this.setState({ loading: true, data: filter });
        try {
            await deletePlanner(id);
        } catch (ex) {
            this.setState({ data: clone });
            toast.error(ex.response.data.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const {
            departments,
            data,
            planners,
            loading,
            sortColumn,
            currentPage,
            pageSize,
            errors,
            lines,
        } = this.state;

        const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
        const rows = paginate(sortedRows, currentPage, pageSize);

        return (
            <form className="row m-2" onSubmit={this.handleSubmit}>
                {loading && (
                    <ReactLoading className="loading" type="spin" color="blue" />
                )}
                <div className="col m-2">
                    {rows.length > 0 && (
                        <PlannerTable
                            rows={rows}
                            onSort={this.handleSort}
                            sortColumn={sortColumn}
                            onDelete={this.handleDelete}
                        />
                    )}
                </div>
                <div className="col-3 m-2">
                    <Department
                        data={departments}
                        onClick={this.handleDepartmentSelect}
                    />
                </div>
                <div className="col-3 m-2">
                    {this.renderSelect("Line", lines, "", this.handleSelectChange)}
                    <p className="mt-2"> </p>

                    {this.renderSelect(
                        "Planners",
                        planners,
                        errors.planners,
                        this.handleSelectChange,
                        "id",
                        "fullName"
                    )}
                    <p className="mt-2"> </p>
                    {this.renderButton("Save", "submit")}
                </div>
            </form>
        );
    }
}

export default PlannerForm;
