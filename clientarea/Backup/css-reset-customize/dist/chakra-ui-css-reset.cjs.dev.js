'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('@emotion/react');
var React = require('react');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

var CSSReset = function CSSReset() {
  return /*#__PURE__*/React__namespace.createElement(react.Global, {
    styles:"" 
  });
};
var CSSReset$1 = CSSReset;

exports.CSSReset = CSSReset;
exports["default"] = CSSReset$1;
