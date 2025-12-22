import React, { Fragment, memo } from "react";

//react bootstrap
import { Link } from "react-router-dom";

import RecentPost from "./sidebar/RecentPost";
import CategoriesWidget from "./sidebar/CategoriesWidget";
import TagsWidget from "./sidebar/TagsWidget";
import FollowUs from "./sidebar/FollowUs";

const DetailMetaList = memo(() => {
  return (
    <Fragment>
      <div className="widget-area">
        <div id="search-2" className="widget widget_search">
          <form
            method="get"
            className="search-form"
            action="#"
            autoComplete="off"
          >
            <div className="block-search_inside-wrapper position-relative d-flex">
              <input
                type="search"
                className="form-control"
                placeholder="Search"
                name="s"
                defaultValue=""
              />
              <button type="submit" className="block-search_button">
                <i aria-hidden="true" className="fa fa-search"></i>
              </button>
            </div>
          </form>
        </div>
        <RecentPost />
        <CategoriesWidget />
        <TagsWidget />
        <FollowUs />
        <div className="widget text-center">
          <Link to="/shop">
            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/01.webp`} />
          </Link>
        </div>
      </div>
    </Fragment>
  );
});

DetailMetaList.displayName = "DetailMetaList";
export default DetailMetaList;
