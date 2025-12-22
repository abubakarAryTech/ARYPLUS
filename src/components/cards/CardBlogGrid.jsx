import React, { memo } from "react";

//react router
import { Link } from "react-router-dom";

const CardBlogGrid = memo((props) => {
  return (
    <div className="iq-blog-box">
      <div className="iq-blog-image clearfix">
        <Link to="">
          <img
            src={props.thumbnail}
            alt=""
            loading="lazy"
            className="img-fluid w-100"
          />
        </Link>
      </div>
      <div className="iq-blog-detail">
        <div className="iq-blog-meta d-flex mb-3">
          <ul className="list-inline mb-0">
            <li className="border-gredient-left">
              <Link to="">
                <span>{props.date}</span>
              </Link>
            </li>
          </ul>
          <ul className="iq-blogtag list-inline">
            <li className="border-gredient-left">
              <Link to={`/blogs-detail/${props.slug}`}>
                {" "}
                {props.categories}
              </Link>
            </li>
          </ul>
        </div>
        <div className="blog-title">
          <Link to={`/blogs-detail/${props.slug}`}>
            <h3 className="mb-3 line-count-1 blog-heading">{props.title}</h3>
          </Link>
        </div>
        <p className="line-count-2">{props.description}</p>
        <div className="iq-button link-button">
          <Link
            to={`/blogs-detail/${props.slug}`}
            className="btn text-capitalize position-relative"
          >
            <span className="button-text">
              Read More
              <i className="fa fa-angle-right ml-2" aria-hidden="true"></i>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
});

CardBlogGrid.displayName = "CardBlogGrid";
export default CardBlogGrid;
