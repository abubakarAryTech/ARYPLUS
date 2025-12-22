import { memo } from "react";
import { Link } from "react-router-dom";

const PersonalityCard = memo((props) => {
  return (
    <div className="text-center">
      <Link to={props.link} style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={props.image}
          alt={props.title}
          className="img-fluid d-block mb-4 full-rounded cast-image-hover"
        />
        <img
          src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/icons/ary-plus/cast-card-arrow.png`}
          alt="View"
          className="cast-arrow-icon"
        />
      </Link>
      <div>
        <h6 className="mb-0">
          <Link
            to={props.link}
            className="font-size-14 text-decoration-none cast-title text-capitalize"
          >
            {props.title}
          </Link>
        </h6>
        {/* <Link
          to={props.categoryLink}
          className="font-size-14 text-decoration-none text-capitalize text-body"
        >
          {props.category}
        </Link> */}
      </div>
    </div>
  );
});

PersonalityCard.displayName = "PersonalityCard";
export default PersonalityCard;
