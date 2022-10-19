import React, { Component } from "react";

const Card = ({
  title,
  bodyText,
  createdDate,
  expireDate,
  isActive,
  onCheck,
  id,
  image,
}) => {
  let result;
  if (expireDate) {
    // getting difference in hours
    result = (new Date(expireDate) - new Date()) / 3600000;
    // if difference less than 2 weeks, notify
  }
  return (
    <div className="card m-2 " style={{ height: "350px", width: "200px" }}>
      <img className="card-img-top" src={image} />
      <div className="card-body row">
        <div className="col">
          <h5 className="card-title">{title}</h5>
        </div>
        <div className="col form-check form-switch d-flex justify-content-end">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={id}
            value={isActive}
            onChange={onCheck}
            checked={isActive}
          />
        </div>
        <p
          className="card-text m-0 d-inline-block text-truncate"
          style={{ maxHeight: "400px", color: "green" }}
        >
          {bodyText}
        </p>
        <p>
          <small className="text-muted">{createdDate}</small>
        </p>
        <div className="d-flex justify-content-between">
          <div
            className={
              isActive && (result < 0 || result < 340)
                ? "p-2 my-auto badge rounded-pill bg-danger"
                : "p-2 my-auto badge rounded-pill bg-success"
            }
          >
            Status
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
