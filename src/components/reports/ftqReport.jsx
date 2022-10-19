import React, { Component } from "react";
import ListGroup from "../common/listGroup";
import Form from "../forms/form";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

class FtqReport extends Form {
  state = {
    selectedListItem: "",
    fields: { from: "", to: "" },
  };

  handleListChange = (item) => {
    this.setState({ selectedListItem: item });
  };

  render() {
    const { fields, selectedListItem } = this.state;
    const lines = [
      { id: 1, name: "smt-1" },
      { id: 2, name: "smt-2" },
    ];
    const reports = [];

    const data = {
      labels: [
        "12 July",
        "13 July",
        "14 July",
        "15 July",
        "16 July",
        "17 July",
      ],
      datasets: [
        {
          label: "",
          data: [33, 53, 85, 41, 44, 65],
          fill: true,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
        },
      ],
    };

    return (
      <>
        <form className="row">
          <div className="col-3">
            {this.renderInput(
              "from",
              "",
              "",
              fields.from,
              this.handleInputChange,
              "",
              true,
              "date"
            )}
            <p className="mt-2"></p>
            {this.renderInput(
              "to",
              "",
              "",
              fields.to,
              this.handleInputChange,
              "",
              true,
              "date"
            )}
            <p className="mt-4"></p>
            <ListGroup
              items={lines}
              reports={reports}
              selectedItem={selectedListItem}
              onItemSelect={this.handleListChange}
            ></ListGroup>
          </div>
          <div className="col">
            <Line data={data} />
          </div>
        </form>
      </>
    );
  }
}

export default FtqReport;
