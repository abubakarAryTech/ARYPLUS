import { memo } from "react";

const ProfileCard2 = memo(({ designation, name, image }) => {
  return (
    <>
      <div className="image-box">
        <img src={image} className="img-fluid w-100" alt="team" />
      </div>
      <div className="box-content">
        <p className="desiganation border-gredient-left mt-3">{designation}</p>
        <h4 className="mb-0">{name}</h4>
      </div>
    </>
  );
});

ProfileCard2.displayName = "ProfileCard2";
export default ProfileCard2;
