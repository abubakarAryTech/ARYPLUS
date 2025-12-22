import React, { memo, Fragment } from "react";

// react-router
import { Link } from "react-router-dom";

// img
// import img1 from "/assets/images/ARYPlus-light-logo.png";
const img1 = `${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`;
const hostar = `${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`;
const prime = `${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`;
const hulu = `${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`;

const Logo = memo(() => {
  return (
    <Fragment>
      <div className="logo-default">
        {/* <Link className="navbar-brand text-primary" to="/"> */}
        <Link className="text-primary HeaderLogo" to="/">
          <img
            className="img-fluid logo"
            src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/ARYPlus-light-logo.png`}
            loading="lazy"
            alt="ARY PLUS"
          />
        </Link>
      </div>
      <div className="logo-hotstar">
        <Link className="navbar-brand text-primary" to="/home">
          <img
            className="img-fluid logo"
            src={hostar}
            loading="lazy"
            alt="streamit"
          />
        </Link>
      </div>
      <div className="logo-prime">
        <Link className="navbar-brand text-primary" to="/home">
          <img
            className="img-fluid logo"
            src={prime}
            loading="lazy"
            alt="streamit"
          />
        </Link>
      </div>
      <div className="logo-hulu">
        <Link className="navbar-brand text-primary" to="/home">
          <img
            className="img-fluid logo"
            src={hulu}
            loading="lazy"
            alt="streamit"
          />
        </Link>
      </div>
    </Fragment>
  );
});

Logo.displayName = "Logo";
export default Logo;
