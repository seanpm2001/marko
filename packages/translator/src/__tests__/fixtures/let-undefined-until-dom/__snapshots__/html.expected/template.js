import { escapeXML as _escapeXML, markResumeNode as _markResumeNode, write as _write, nextScopeId as _nextScopeId, writeEffect as _writeEffect, createRenderer as _createRenderer, createTemplate as _createTemplate } from "@marko/runtime-fluurt/src/html";
const _renderer = /* @__PURE__ */_createRenderer((input, _tagVar, _scope0_) => {
  const _scope0_id = _nextScopeId();
  const x = undefined;
  _write(`<div>${_escapeXML(x)}${_markResumeNode(_scope0_id, "#text/0")}</div>`);
  _writeEffect(_scope0_id, "packages/translator/src/__tests__/fixtures/let-undefined-until-dom/template.marko_0");
});
export default /* @__PURE__ */_createTemplate(_renderer, "packages/translator/src/__tests__/fixtures/let-undefined-until-dom/template.marko");