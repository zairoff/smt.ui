import React, { Component } from "react";

const Input = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  type,
  innerRef,
  readOnly,
  onKeyDown,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        ref={innerRef}
        value={value}
        onChange={onChange}
        id={name}
        type={type}
        placeholder={placeholder}
        className="form-control form-control-lg"
        required={required}
        autoComplete="off"
        readOnly={readOnly}
        onKeyDown={onKeyDown}
      ></input>
      {error && <div className="alert alert-danger p-2">{error}</div>}
    </div>
  );
};

export default Input;
