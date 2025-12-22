import { memo } from "react";
import { Link } from "react-router-dom";

const TopTenCard = memo((props) => {
  return (
    <div className="iq-top-ten-block">
      <div className="block-image position-relative">
        <div className="img-box d-flex align-items-center">
          <Link className="overly-images" to={props.link}>
            <img
              src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/count/aryplus/${props.countValue}.png?v=1.0`}
              alt="count number"
              className="svg-icon"
            />
            <img
              src={props.imagePath}
              alt="movie-card"
              className="posterImage img-fluid object-cover"
            />
          </Link>
        </div>
      </div>
    </div>

    // <div className="iq-top-ten-block">
    //   <div className="block-image position-relative">
    //     <div className="img-box">
    //       <Link className="overly-images" to={props.link}>
    //         <img
    //           src={props.imagePath}
    //           alt="movie-card"
    //           className="img-fluid object-cover"
    //         />
    //       </Link>
    //       {/* texture-text */}
    //       <span className="top-ten-numbers">{props.countValue}</span>
    //     </div>
    //   </div>
    // </div>
  );
});

TopTenCard.displayName = "TopTenCard";
export default TopTenCard;
