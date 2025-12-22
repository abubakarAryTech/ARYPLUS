import React, { Fragment, memo } from "react";
import { blogTags } from "../../../StaticData/blogs";
import { Link } from "react-router-dom";

const TagsWidget = memo((props) => {
  const cast = props.cast;
  const poster = props.poster;
  return (
    <Fragment>
      <div id="tag_cloud-2" className="widget">
        <h5 className="widget-title position-relative">Cast</h5>
        <div className="tagcloud">
          <ul className="p-0 m-0 list-unstyled gap-2 widget_tags">
            {/* {cast.map((tags, index)=>{
            return (
                <li key={index}>
                    <Link to="/blogs-tag" className="position-relative">{tags.name}</Link>
                </li>
            )
          })} */}

            {cast && cast.length > 0 ? (
              <>
                {cast.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={`/cast-view-all/${item}`}
                      className="position-relative"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </>
            ) : (
              ""
            )}
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

TagsWidget.displayName = "TagsWidget";
export default TagsWidget;
