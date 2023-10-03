import { write as _write, escapeXML as _escapeXML, markResumeNode as _markResumeNode, SYMBOL_OWNER as _SYMBOL_OWNER, markResumeControlSingleNodeEnd as _markResumeControlSingleNodeEnd, nextScopeId as _nextScopeId, writeScope as _writeScope, maybeFlush as _maybeFlush, createRenderer as _createRenderer, createTemplate as _createTemplate } from "@marko/runtime-fluurt/src/html";
const _renderer = /* @__PURE__ */_createRenderer((input, _tagVar, _scope0_) => {
  const _scope0_id = _nextScopeId();
  _write("<div>");
  const _forScopeIds = [],
    _scope1_ = new Map();
  for (const key in input.children) {
    const _scope1_id = _nextScopeId();
    const text = input.children[key];
    _forScopeIds.push(_scope1_id);
    _write(`<p>${_escapeXML(key)}${_markResumeNode(_scope1_id, "#text/0")}: <!>${_escapeXML(text)}${_markResumeNode(_scope1_id, "#text/1")}</p>`);
    _writeScope(_scope1_id, (_s => (_scope1_.set(key, _s), _s))({
      [_SYMBOL_OWNER]: _scope0_id
    }));
    _maybeFlush();
  }
  _write(`${_markResumeControlSingleNodeEnd(_scope0_id, "#text/0", _forScopeIds)}`);
  const _forScopeIds2 = [],
    _scope2_ = new Map();
  for (const key in input.children) {
    const _scope2_id = _nextScopeId();
    _forScopeIds2.push(_scope2_id);
    _write(`<p>${_escapeXML(key)}${_markResumeNode(_scope2_id, "#text/0")}</p>`);
    _writeScope(_scope2_id, (_s2 => (_scope2_.set(key, _s2), _s2))({
      [_SYMBOL_OWNER]: _scope0_id
    }));
    _maybeFlush();
  }
  _write(`${_markResumeControlSingleNodeEnd(_scope0_id, "#text/1", _forScopeIds2)}</div>`);
  _writeScope(_scope0_id, {
    "#text/0(": _scope1_.size ? _scope1_ : undefined,
    "#text/1(": _scope2_.size ? _scope2_ : undefined
  }, _scope0_);
});
export default /* @__PURE__ */_createTemplate(_renderer, "packages/translator/src/__tests__/fixtures/create-and-clear-rows-loop-in/template.marko");