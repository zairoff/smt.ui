import React, { Component } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import {
  getMachineRepairByMachineIdAndDate,
  updateMachineRepair,
} from "../services/machineRepairService";
import Card from "./common/card";
import repairImage from "../assets/images/repair2.jpg";
import { format } from 'date-fns';

class MachineHistory extends Component {
  state = { data: [] };

  async componentDidMount() {
    const { machineId } = this.props.params;
    this.setState({ loading: true });
    try {
      const { data } = await getMachineRepairByMachineIdAndDate(
        machineId,
        format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      );
      console.log("daa", data);
      this.setState({ data });
    } catch (ex) {
      console.log(ex);
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleCheck = async ({ target }) => {
    const { id, value } = target;
    const { data } = this.state;
    const clone = [...data];
    const isActive = value === "true";
    data.forEach((d) => (d.id == id ? (d.isActive = !d.isActive) : d.isActive));
    this.setState({ data, loading: true });
    try {
      await updateMachineRepair(target.id, { isActive: !isActive });
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleInputChange = async ({ target }) => {
    this.setState({ loading: true });
    const { machineId } = this.props.params;
    try {
      const { data } = await getMachineRepairByMachineIdAndDate(
        machineId,
        target.value
      );
      this.setState({ data, loading: false });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, loading } = this.state;
    return (
      <>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <input
          className="form-control m-4"
          type="month"
          onChange={this.handleInputChange}
        />
        <div className="d-flex flex-wrap ms-4 me-4">
          {data.map((d) => (
            <Card
              key={d.id}
              title={d.machine.name}
              bodyText={d.issue}
              createdDate={d.createdDate}
              expireDate={d.notificationDate}
              isActive={d.isActive}
              onCheck={this.handleCheck}
              id={d.id}
              image={repairImage}
            />
          ))}
        </div>
      </>
    );
  }
}

export default () => (
  <MachineHistory params={useParams()} location={useLocation()} />
);
