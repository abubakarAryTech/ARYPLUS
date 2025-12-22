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
      className="mt-2 py-2 mt-md-5 py-md-5"

    >
      <div className="container-fluid h-100">
        <div className="row align-items-center justify-content-center h-100 parallaxt-detailss paddingLeftRight">
          {/* Conditionally render text on left or right based on isLogin */}
          {isLogin ? (
              <div>
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
          ) : (
              <div>
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
          )}
        </div>
      </div>
    </section>
  );
}
