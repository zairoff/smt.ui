import React, { Component } from "react";

// Type-to-search model picker (a plain select is unusable with hundreds of models).
// Options show the SAP code too, since model names alone aren't always unique.
const optionLabel = (model) => (model.sapCode ? `${model.name} · ${model.sapCode}` : model.name);

class ModelPicker extends Component {
  state = { text: "" };

  // The id this picker last reported - lets componentDidUpdate tell a selection made
  // from outside (sync the text) apart from the operator typing (leave the text alone).
  emittedId = "";

  componentDidMount() {
    this.syncText();
  }

  componentDidUpdate(prevProps) {
    const idChanged = String(prevProps.modelId || "") !== String(this.props.modelId || "");
    if ((idChanged || prevProps.models !== this.props.models) && String(this.props.modelId || "") !== this.emittedId)
      this.syncText();
  }

  syncText() {
    const { models, modelId } = this.props;
    const model = models.find((m) => String(m.id) === String(modelId));
    this.emittedId = model ? String(model.id) : "";
    this.setState({ text: model ? optionLabel(model) : "" });
  }

  handleChange = (e) => {
    const text = e.target.value;
    const model = this.props.models.find((m) => optionLabel(m) === text);
    this.setState({ text });

    const id = model ? String(model.id) : "";
    if (id !== this.emittedId) {
      this.emittedId = id;
      this.props.onChange(id);
    }
  };

  render() {
    const { models, label, placeholder, id = "modelPicker" } = this.props;

    return (
      <div className="form-group">
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          list={`${id}-options`}
          className="form-control form-control-lg"
          value={this.state.text}
          placeholder={placeholder}
          onChange={this.handleChange}
          autoComplete="off"
        />
        <datalist id={`${id}-options`}>
          {models.map((m) => (
            <option key={m.id} value={optionLabel(m)} />
          ))}
        </datalist>
      </div>
    );
  }
}

export default ModelPicker;
