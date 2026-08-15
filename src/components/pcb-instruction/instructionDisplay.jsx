import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { withTranslation } from "react-i18next";
import config from "../../config.json";
import { getCurrentInstructionByPosition } from "../../services/modelInstructionImageService";

const POLL_INTERVAL_MS = 20000;

class InstructionDisplay extends Component {
  state = { instruction: null, loading: true };

  async componentDidMount() {
    await this.poll();
    this.intervalId = setInterval(this.poll, POLL_INTERVAL_MS);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  poll = async () => {
    const { positionId } = this.props.params;

    try {
      const { data } = await getCurrentInstructionByPosition(positionId);
      this.setState({ instruction: data, loading: false });
    } catch (ex) {
      this.setState({ loading: false });
    }
  };

  render() {
    const { t } = this.props;
    const { instruction, loading } = this.state;

    const containerStyle = {
      height: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000",
    };

    const messageStyle = {
      color: "#fff",
      fontSize: "2rem",
      textAlign: "center",
      padding: "2rem",
    };

    if (loading) {
      return (
        <div style={containerStyle}>
          <div style={messageStyle}>
            {t("pcbaInstruction:instructionDisplay.loading")}
          </div>
        </div>
      );
    }

    if (!instruction || (!instruction.hasActiveModel && !instruction.positionName)) {
      return (
        <div style={containerStyle}>
          <div style={messageStyle}>
            {t("pcbaInstruction:instructionDisplay.positionNotFound")}
          </div>
        </div>
      );
    }

    if (!instruction.hasActiveModel) {
      return (
        <div style={containerStyle}>
          <div style={messageStyle}>
            {t("pcbaInstruction:instructionDisplay.noActiveModel")}
          </div>
        </div>
      );
    }

    if (!instruction.hasImage) {
      return (
        <div style={containerStyle}>
          <div style={messageStyle}>
            {t("pcbaInstruction:instructionDisplay.noImage")}
          </div>
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        <img
          src={config.fileUrl + instruction.imagePath}
          alt={instruction.positionName}
          style={{
            maxHeight: "100vh",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    );
  }
}

const TranslatedInstructionDisplay = withTranslation("pcbaInstruction")(
  InstructionDisplay
);

export default () => (
  <TranslatedInstructionDisplay params={useParams()} />
);
