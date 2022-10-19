import React from "react";
import { Link } from "react-router-dom";

const MachineCard = ({ id, title, imageUrl }) => {
  return (
    <div className="card m-2 shadow" style={{ maxWidth: "12rem" }}>
      <img className="card-img-top" src={imageUrl} alt="Card image cap" />
      <div className="card-body d-flex justify-content-start align-items-end">
        <Link to={"/machine-history/" + id} className=" link">
          {title}
        </Link>
      </div>
    </div>
  );
};

export default MachineCard;
