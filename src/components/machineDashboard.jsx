import React, { Component } from "react";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getMachines } from "../services/machineService";
import Card from "./common/card";
import MachineCard from "./machineCard";
import config from "../config.json";

class MachineDashborad extends Component {
  state = {
    data: [],
    loading: true,
  };

  async componentDidMount() {
    this.setState({ loading: true });
    try {
      const { data } = await getMachines();
      console.log("daa", data);
      this.setState({ data });
    } catch (ex) {
      toast.error(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const fileUrl = config.fileUrl;
    return (
      <>
        {this.state.loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="d-flex flex-wrap mt-4">
          {this.state.data.map((d) => (
            <MachineCard
              key={d.id}
              id={d.id}
              title={d.name}
              imageUrl={fileUrl + d.imageUrl}
            />
          ))}
        </div>
      </>
    );
  }
}

export default MachineDashborad;
