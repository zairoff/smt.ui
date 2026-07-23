import _ from "lodash";
import React from "react";

const Select = ({
  name,
  label,
  options,
  error,
  onChange,
  propertyKey,
  propertyValue,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label || name}</label>
      <select
        onChange={onChange}
        name={name}
        id={name}
        required={true}
        className="form-control form-control-lg"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="" />
        {options.map((option) => (
          <option
            key={_.get(option, propertyKey)}
            value={_.get(option, propertyKey)}
          >
            {_.get(option, propertyValue)}
          </option>
        ))}
      </select>
      {error && (
        <div className="alert alert-danger p-2" id={`${name}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Select;
