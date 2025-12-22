import React, { Fragment, memo } from "react";

//react bootstrap
import { Link } from "react-router-dom";

import RecentPost from "../components/blog/sidebar/RecentPost";
import CategoriesWidget from "../components/blog/sidebar/CategoriesWidget";
import TagsWidget from "../components/blog/sidebar/TagsWidget";
import FollowUs from "../components/blog/sidebar/FollowUs";

const SeriesSidebar = memo((props) => {
  const cast = props.cast;
  const poster = props.poster;
  const genre = props.genre;
  const type = props.type;
  const seriesId = props.seriesId;

  return (
    <Fragment>
      <div className="widget-area">
        {type != "single-series" ? (
          <>
            {poster && poster !== "poster/BG-BLACK_1721723912095.jpg" ? (
              <div className="widget poster d-flex justify-content-center">
                <img
                  src={`${import.meta.env.VITE_APP_IMAGE_PATH}${poster}`}
                  alt="Poster"
                />
              </div>
            ) : null}

            {genre &&
            genre.length > 0 &&
            !genre.some((item) => item.title === "Unlisted") ? (
              <div id="categories-2" className="widget widget_categories">
                <h5 className="widget-title position-relative">Genre</h5>
                <ul className="p-0 m-0 list-unstyled">
                  <>
                    {genre.map((item, index) => (
                      <li className="text-capitalize" key={index}>
                        <Link to="#" className="position-relative">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </>
                </ul>
              </div>
            ) : null}
          </>
        ) : null}

        {/* <div id="search-2" className="widget widget_search">
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
        </div> */}
        {/* <RecentPost /> */}

        {cast && cast.length > 0 ? <TagsWidget cast={cast} /> : null}

        <FollowUs heading="Share Playlist On:" seriesId={seriesId} />
        {/* <div className="widget text-center">
          <Link to="/shop">
            <img src={`${import.meta.env.VITE_APP_IMAGE_PATH}images/blog/01.webp`} />
          </Link>
        </div> */}
      </div>
    </Fragment>
  );
});

SeriesSidebar.displayName = "SeriesSidebar";
export default SeriesSidebar;
