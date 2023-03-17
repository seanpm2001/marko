"use strict";

exports.__esModule = true;
exports.default = void 0;
var _index = require("marko/src/runtime/html/index.js");
var _selfIterator = _interopRequireDefault(require("marko/src/runtime/helpers/self-iterator.js"));
var _index2 = _interopRequireDefault(require("./components/some-tag/index.marko"));
var _renderTag = _interopRequireDefault(require("marko/src/runtime/helpers/render-tag.js"));
var _renderer = _interopRequireDefault(require("marko/src/runtime/components/renderer.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const _marko_componentType = "packages/translator-default/test/fixtures/error-at-tags-repeated-not-allowed/template.marko",
  _marko_template = (0, _index.t)(_marko_componentType);
var _default = _marko_template;
exports.default = _default;
const _marko_component = {};
_marko_template._ = (0, _renderer.default)(function (input, out, _componentDef, _component, state, $global) {
  (0, _renderTag.default)(_index2.default, {
    "header": [{
      "class": "my-header",
      "renderBody": out => {
        out.w("Header content");
      },
      [Symbol.iterator]: _selfIterator.default
    }, {
      "class": "my-header",
      "renderBody": out => {
        out.w("Header content");
      },
      [Symbol.iterator]: _selfIterator.default
    }]
  }, out, _componentDef, "0");
}, {
  t: _marko_componentType,
  i: true,
  d: true
}, _marko_component);