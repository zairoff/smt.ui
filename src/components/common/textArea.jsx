import React from "react";

const TextArea = ({ name, label, value, onChange }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <textarea
        className="form-control"
        id={name}
        rows="3"
        value={value}
        onChange={onChange}
      ></textarea>
    </div>
  );
};

export default TextArea;
