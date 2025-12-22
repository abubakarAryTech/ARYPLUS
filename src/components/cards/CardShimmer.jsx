import React from "react";

const CardShimmer = (props) => {
  const height = props.height;
  return (
    <>
      <style>
        {`
          .cardShimmer .shimmer {
            background: #f6f7f8;
            background-image: linear-gradient(
              to right,
              #f6f7f8 0%,
              #edeef1 20%,
              #f6f7f8 40%,
              #f6f7f8 100%
            );
            background-repeat: no-repeat;
            background-size: 800px 100%;
            animation: shimmer 1.5s infinite linear;
          }

          @keyframes shimmer {
            0% {
              background-position: -800px 0;
            }
            100% {
              background-position: 800px 0;
            }
          }

          .cardShimmer .hover-custom-card {
            width: 300px; /* Adjust as needed */
            margin: 10px;
            
          }

          .cardShimmer .iq-card {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            
          }

          .cardShimmer .block-images {
          
            height: ${height}px; /* Adjust as needed */


            background: linear-gradient(92.43deg, #414449 11%, #414449 113.58%) !important;
            // background: rgba(31, 31, 31, 1) !important;
            background-image: linear-gradient(
              to right,
              #f6f7f8 0%,
              #edeef1 20%,
              #f6f7f8 40%,
              #f6f7f8 100%
            );
            background-repeat: no-repeat;
            animation: shimmer 1.5s infinite linear;
          }

          .cardShimmer .card-description {
            padding: 10px;
          }

          .cardShimmer .block-social-info {
            display: flex;
            justify-content: space-between;
            padding: 10px;
          }

          
        @media (max-width: 768px) {
            .cardShimmer .block-images {
        
        height: 100px; /* Adjust as needed */
        }
        }
        `}
      </style>
      <div className="hover-custom-card cardShimmer">
        <div className="iq-card card-hover">
          <div className="block-images position-relative w-100">
            <div className="img-box w-100 position-relative">
              <div
                className="shimmer"
                style={{ height: "100%", width: "100%" }}
              ></div>
            </div>
          </div>
          <div className="card-description with-transition">
            <div className="cart-content">
              <div className="w-100">
                <div className="d-flex justify-content-between align-items-start mt-2">
                  <div
                    className="shimmer"
                    style={{ height: "20px", width: "70%" }}
                  ></div>
                  <div
                    className="shimmer"
                    style={{ height: "15px", width: "20px" }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div
                    className="shimmer"
                    style={{ height: "15px", width: "40%" }}
                  ></div>
                  <div
                    className="shimmer"
                    style={{ height: "15px", width: "30%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="block-social-info align-items-center">
            <div className="iq-button">
              <div
                className="shimmer rounded-circle"
                style={{ width: "40px", height: "40px" }}
              ></div>
            </div>
            <ul className="p-0 m-0 d-flex gap-2 music-play-lists">
              <li className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center">
                <div
                  className="shimmer"
                  style={{ width: "20px", height: "20px" }}
                ></div>
              </li>
              <li className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center">
                <div
                  className="shimmer"
                  style={{ width: "20px", height: "20px" }}
                ></div>
              </li>
              <li className="share position-relative d-flex align-items-center text-center mb-0 justify-content-center">
                <div
                  className="shimmer"
                  style={{ width: "20px", height: "20px" }}
                ></div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardShimmer;
