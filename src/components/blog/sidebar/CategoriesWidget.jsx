import React, { Fragment, memo } from "react";
import { blogCategories } from "../../../StaticData/blogs";
import { Link } from "react-router-dom";

const CategoriesWidget = memo(() => {
  return (
    <Fragment>
      <div id="categories-2" className="widget widget_categories">
        <h5 className="widget-title position-relative">Categories</h5>
        <ul className="p-0 m-0 list-unstyled">
          {blogCategories.map((item, index) => {
            return (
              <li className="text-capitalize" key={index}>
                <Link to="/blogs-category" className="position-relative">
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Fragment>
  );
});

export default CategoriesWidget;
