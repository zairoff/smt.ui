import _ from "lodash";
import React from "react";

const Select = ({
  name,
  options,
  error,
  onChange,
  propertyKey,
  propertyValue,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{name}</label>
      <select
        onChange={onChange}
        name={name}
        id={name}
        required={true}
        className="form-control form-control-lg"
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
      {error && <div className="alert alert-danger p-2">{error}</div>}
    </div>
  );
};

export default Select;
