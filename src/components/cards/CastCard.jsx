import React, { Fragment, memo } from "react";
import { Link } from "react-router-dom";

const CastCard = memo((props) => {
  return (
    <Fragment>
      <div className="iq-cast">
        <img src={props.image} alt={`cast-${props.title}`} loading="lazy" />
        <div className="card-img-overlay iq-cast-body">
          <h6 className="cast-title fw-500">
            <Link to="/cast-detail">{props.title}</Link>
          </h6>
          <span className="cast-subtitle">{props.category}</span>
        </div>
      </div>
    </Fragment>
  );
});

CastCard.displayName = "CastCard";
export default CastCard;
