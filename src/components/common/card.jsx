import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");
  let result;
  if (expireDate) {
    // getting difference in hours
    result = (new Date(expireDate) - new Date()) / 3600000;
    // if difference less than 2 weeks, notify
  }
  return (
    <div className="card m-2 " style={{ height: "350px", width: "200px" }}>
      <img className="card-img-top" src={image} alt={title || ""} />
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
          className="card-text m-0 d-inline-block text-truncate text-success"
          style={{ maxHeight: "400px" }}
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
            {t("card.status")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
