import { Link } from "react-router-dom";
import Trending from "./Trending";

export default function () {
  return (
    <>
      <section
        id="parallex"
        className="parallax-window bg-attachment-fixed"
        style={{
          background: "url(assets/images/parallax/bg2.webp) fixed",
        }}
      >
        <div className="container-fluid h-100">
          <div className="row align-items-center justify-content-center h-100 parallaxt-details">
            <div className="col-xl-5 col-lg-12 col-md-12 r-mb-23">
              <div
                className="text-start  bg-black border"
                style={{
                  padding: 15,
                  width: 343,
                  height: 253,
                  gap: 16,
                }}
              >
                <h4
                  className="mb-4 mt-3 "
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  Choose by Cast
                </h4>

                <p
                  style={{
                    width: 163,
                    height: 72,
                    top: 96.08,
                    left: 22,
                  }}
                >
                  The faces you know. The stories you can’t miss.
                </p>
              </div>
            </div>
            <div className="col-xl-7 col-lg-12 col-md-12 mt-5 mt-xl-0">
              {/* <div className="parallax-img">
                <Link to="">
                  <img
                    src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/parallax/parallex.webp`}
                    className="img-fluid w-100"
                    loading="lazy"
                    alt="bailey"
                  />
                </Link>
              </div> */}
              <Trending />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
