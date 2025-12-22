import _ from "lodash";

// get element by selector all
export const getElems = (selector) => {
  return document.querySelectorAll(selector);
};

// set attribute value
export const setAttr = function (elems, object) {
  let _newElem = elems;
  if (_.isString(_newElem)) {
    _newElem = getElems(elems);
  }
  _.forEach(_newElem, function (elem) {
    elem.setAttribute(object.prop, object.value);
  });
};
