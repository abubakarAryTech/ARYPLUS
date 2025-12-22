import React, { Fragment } from "react";

// react-router
import { Link } from "react-router-dom";

const TagsCard = React.memo((props) => {
  return (
    <Fragment>
      <Link to="/view-all">
        <span className="iq-tag-box">{props.title}</span>
      </Link>
    </Fragment>
  );
});

TagsCard.displayName = "TagsCard";
export default TagsCard;
