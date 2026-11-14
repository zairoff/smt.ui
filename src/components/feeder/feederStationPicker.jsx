import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getLines } from "../../services/lineService";
import { errorMessage } from "../../services/feeder/feederConstants";

// Entry point from the menu: pick the line, then the station opens full-screen for it.
// The line PC can bookmark /feeder-station/<lineId> directly.
class FeederStationPicker extends Component {
  state = { lines: [] };

  async componentDidMount() {
    try {
      const { data: lines } = await getLines();
      this.setState({ lines: lines.filter((l) => l.isActive !== false) });
    } catch (ex) {
      toast.error(errorMessage(ex));
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div>
        <h5>{t("feeder:station.pickLine")}</h5>
        <p className="text-muted">{t("feeder:station.pickLineHint")}</p>
        <div className="d-flex flex-wrap gap-3">
          {this.state.lines.map((line) => (
            <Link
              key={line.id}
              to={`/feeder-station/${line.id}`}
              className="btn btn-primary btn-lg px-5 py-4 fs-3"
            >
              {line.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }
}

export default withTranslation(["feeder", "common"])(FeederStationPicker);
