import { memo } from "react";
import logger from '../../services/logger';

import { removeUserSession } from "../../services/user";

const ProfileCard = memo(({ os, device, image, date, id }) => {
  const remove_session = async (id) => {
    try {
      await removeUserSession(id);
      alert("Device removed");
    } catch (err) {
      logger.error("Error removing device:", err);
      alert("Failed to remove device. Please try again.");
    }
  };
  return (
    <>
      <div className="image-box">
        <img src={image} className="img-fluid w-100" alt="team" />
      </div>
      <div className="box-content">
        <p className="desiganation border-gredient-left mt-3">{device}</p>
        <h4 className="mb-0">{os}</h4>
        <p className="mt-5 mb-0">Login Time: </p>
        <p>{date}</p>
      </div>
      <div className="iq-button my-5">
        <a
          onClick={() => remove_session(id)}
          className="btn btn-sm text-uppercase position-relative"
        >
          <span className="button-text">Remove Device</span>
          <i className="fa-solid fa-remove"></i>
        </a>
      </div>
    </>
  );
});

ProfileCard.displayName = "ProfileCard";
export default ProfileCard;
