import React from "react";

const TextArea = ({ name, label, value, onChange, error }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <textarea
        className="form-control"
        id={name}
        rows="2"
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      ></textarea>
      {error && (
        <div className="alert alert-danger p-2" id={`${name}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default TextArea;
