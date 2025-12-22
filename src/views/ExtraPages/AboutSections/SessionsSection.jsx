import { memo, useState } from "react";
import ProfileCard from "../../../components/cards/ProfileCard";
import { generateImgPath } from "../../../StaticData/data";
const TeamSection = memo((props) => {
  const getImageSource = (osName) => {
    osName = osName.toLowerCase();
    if (osName.includes("windows")) {
      return "/assets/images/devices/Windows.png";
    } else if (
      osName.includes("ios") ||
      osName.includes("iphone") ||
      osName.includes("mac")
    ) {
      return "/assets/images/devices/apple.jpg";
    } else if (osName.includes("android")) {
      return "/assets/images/devices/android.webp";
    } else {
      return "/assets/images/devices/default.png";
      // Fallback image
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <section className="section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-sm-12">
            <div className="title-box text-center">
              <h2>Linked Devices</h2>
              <p className="mb-0">
                You are allowed to access ARYZAP from 5 devices at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row about-us-detail">
          {props.data.map((data, index) => (
            <div key={index} className="col-md-3 my-2">
              {/* <ProfileCard
                os = {`${data.os.name} ${data.os.version}`}
                device = {`${data.device} ${data.version}`}
                image = {getImageSource(data.os.name)}
                date = {formatDate(data.loginTime)}
                id = {data.id}                                        
              ></ProfileCard> */}

              <div className="card" style={{ "border-radius": "5%" }}>
                <img
                  src={getImageSource(data.os.name)}
                  className="card-img-top"
                  style={{ width: "100px" }}
                  alt="..."
                ></img>
                <div className="card-body">
                  <p className="card-text">{`${data.os.name} ${data.os.version}`}</p>
                  <p className="card-text">{`${data.device} ${data.version}`}</p>
                  <p className="card-text">
                    Login Time:{" "}
                    <span className="d-block">
                      {formatDate(data.loginTime)}
                    </span>{" "}
                  </p>

                  <div className="">
                    <a
                      onClick={() => remove_session(id)}
                      className="btn btn-sm p-2 w-100 btn-primary text-uppercase position-relative"
                    >
                      <span className="button-text p-0 m-0">
                        <i className="fa-solid fa-remove"></i> Remove
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TeamSection.displayName = "TeamSection";
export default TeamSection;
