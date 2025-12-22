import { Link } from "react-router-dom";
import Trending from "./Trending";

export default function ParallexSection({
  title,
  image,
  icon,
  buttonName,
  buttonAction,
  isLogin,
}) {
  return (
    <section
      id="parallex"
      className="parallax-window bg-attachment-fixed mt-5 py-5"
    >
      <div className="container-fluid h-100">
        <div className="row align-items-center justify-content-center h-100 parallaxt-detailss paddingLeftRight">
          {/* Conditionally render text on left or right based on isLogin */}
          {isLogin ? (
            <>
              {/* TEXT on LEFT */}
              <div className="col-xl-6 col-lg-12 col-md-12 r-mb-23 pl-25 order-1 order-xl-1">
                <div className="text-start">
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}promotionalBanner/${icon}`}
                    alt="CTA Icon"
                  />
                  <h2 className="big-font-4 mb-4 mt-3">{title}</h2>

                  <div className="iq-button">
                    <Link
                      to={buttonAction}
                      className="btn newbtn text-uppercase position-relative"
                    >
                      <span className="button-text">{buttonName}</span>
                      {/* <i className="fa-solid fa-play"></i> */}
                    </Link>
                  </div>
                </div>
              </div>

              {/* IMAGE on RIGHT */}
              <div className="col-xl-6 col-lg-12 col-md-12 mt-5 mt-xl-0 pr-25 order-2 order-xl-2">
                <div className="parallax-img">
                  <Link to={buttonAction}>
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}promotionalBanner/${image}`}
                      className="img-fluid w-70"
                      loading="lazy"
                      alt={buttonName}
                    />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* IMAGE on LEFT */}
              <div className="col-xl-6 col-lg-12 col-md-12 mt-5 mt-xl-0 pr-25 order-1 order-xl-1">
                <div className="parallax-img">
                  <Link to={buttonAction}>
                    <img
                      src={`${import.meta.env.VITE_APP_IMAGE_PATH}promotionalBanner/${image}`}
                      className="img-fluid w-70"
                      loading="lazy"
                      alt={buttonName}
                    />
                  </Link>
                </div>
              </div>

              {/* TEXT on RIGHT */}
              <div className="col-xl-6 col-lg-12 col-md-12 r-mb-23 pl-25 order-2 order-xl-2">
                <div className="text-start">
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}promotionalBanner/${icon}`}
                    alt="CTA Icon"
                  />
                  <h2 className="big-font-4 mb-4 mt-3">{title}</h2>

                  <div className="iq-button">
                    <Link
                      to={buttonAction}
                      className="btn newbtn text-uppercase position-relative"
                    >
                      <span className="button-text">{buttonName}</span>
                      {/* <i className="fa-solid fa-play"></i> */}
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
