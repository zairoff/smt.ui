import React from "react";

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
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      ></input>
      {error && (
        <div className="alert alert-danger p-2" id={`${name}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
