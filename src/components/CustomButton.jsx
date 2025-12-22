import React, { memo, Fragment, useState } from "react";

// react-router
import { Link } from "react-router-dom";

import Loader from "../components/ReactLoader";

const CustomButton = memo((props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkClick = () => {
    setIsLoading(true);
  };
  return (
    <Fragment>
      {isLoading && <Loader />}
      {props.linkButton === "true" && (
        <div className="iq-button link-button">
          <Link
            to={props.link}
            className="btn text-capitalize position-relative"
          >
            <span className="button-text">{props.buttonTitle}</span>
          </Link>
        </div>
      )}
      {props.linkButton === "false" && (
        <div className="iq-button">
          <Link
            onClick={handleLinkClick}
            to={props.link}
            className="btn text-uppercase position-relative"
          >
            <span className="button-text">{props.buttonTitle}</span>
            <i className="fa-solid fa-play"></i>
          </Link>
        </div>
      )}
    </Fragment>
  );
});

CustomButton.displayName = "CustomButton";
export default CustomButton;
