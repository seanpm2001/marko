const _marko_template = _t();

export default _marko_template;
import _await from "marko/dist/core-tags/core/await/renderer.js";
import _marko_tag from "marko/dist/runtime/helpers/render-tag";
import _marko_renderer from "marko/dist/runtime/components/renderer";
import { t as _t } from "marko/dist/runtime/vdom";
import { r as _marko_registerComponent } from "marko/dist/runtime/components/registry-browser";

const _marko_componentType = _marko_registerComponent("8BXCo81d", () => _marko_template),
      _marko_component = {};

_marko_template._ = _marko_renderer(function (input, out, _component, component, state) {
  _marko_tag(_await, {
    "_provider": promise,
    "_name": "promise",
    "then": {
      "renderBody": (out, result) => {
        out.t(result, component);
      }
    }
  }, out, _component, "0");
}, {
  t: _marko_componentType,
  i: true
}, _marko_component);
import _marko_defineComponent from "marko/dist/runtime/components/defineComponent";
_marko_template.Component = _marko_defineComponent(_marko_component, _marko_template._);