import { types as t } from "@marko/compiler";
import { getTagDef } from "@marko/babel-utils";
import { isOutputHTML } from "../../util/marko-config";
import attrsToObject from "../../util/attrs-to-object";
import {
  callRead,
  callRuntime,
  getHTMLRuntime,
  getScopeExpression,
} from "../../util/runtime";
import translateVar from "../../util/translate-var";
import evaluate from "../../util/evaluate";
import { getOrCreateSectionId, getSectionId } from "../../util/sections";
import { ReserveType, reserveScope } from "../../util/reserve";
import { addStatement, addHTMLHydrateCall } from "../../util/signals";
import * as writer from "../../util/writer";
import * as walks from "../../util/walks";
import { currentProgramPath, scopeIdentifier } from "../program";
import type { Identifier } from "@marko/compiler/babel-types";

declare module "@marko/compiler/dist/types" {
  export interface ProgramExtra {
    isInteractive?: boolean;
  }
}

export default {
  analyze: {
    enter(tag: t.NodePath<t.MarkoTag>) {
      const { node } = tag;
      const attrs = tag.get("attributes");
      let sectionId = tag.has("var") ? getOrCreateSectionId(tag) : undefined;

      if (attrs.some(isSpreadAttr)) {
        // TODO
      } else {
        for (const attr of attrs as t.NodePath<t.MarkoAttribute>[]) {
          const attrNode = attr.node;
          const { name } = attrNode;

          if (isEventHandler(name)) {
            sectionId ??= getOrCreateSectionId(tag);
            (currentProgramPath.node.extra ?? {}).isInteractive = true;
          } else if (!evaluate(attr).confident) {
            sectionId ??= getOrCreateSectionId(tag);
          }
        }
      }

      const name = node.var
        ? (node.var as t.Identifier).name
        : (node.name as t.StringLiteral).value;

      if (sectionId !== undefined) {
        reserveScope(ReserveType.Visit, sectionId, node, name);
      }
    },
  },
  translate: {
    enter(tag: t.NodePath<t.MarkoTag>) {
      const { extra } = tag.node;
      const isHTML = isOutputHTML();
      const name = tag.get("name");
      const attrs = tag.get("attributes");
      const tagDef = getTagDef(tag);
      const hasSpread = attrs.some((attr) => attr.isMarkoSpreadAttribute());
      const write = writer.writeTo(tag);
      const sectionId = getSectionId(tag);

      // TODO: throw error if var is not an identifier (like let)

      if (isHTML && extra.tagNameNullable) {
        writer.flushBefore(tag);
      }

      if (tag.has("var")) {
        if (isHTML) {
          translateVar(
            tag,
            t.arrowFunctionExpression(
              [],
              t.blockStatement([
                t.throwStatement(
                  t.newExpression(t.identifier("Error"), [
                    t.stringLiteral("Cannot reference DOM node from server"),
                  ])
                ),
              ])
            )
          );
        } else {
          const varName = (tag.node.var as Identifier).name;
          const references = tag.scope.getBinding(varName)!.referencePaths;
          let createElFunction = undefined;
          for (const reference of references) {
            const referenceSectionId = getSectionId(reference);
            if (reference.parentPath?.isCallExpression()) {
              reference.parentPath.replaceWith(
                t.expressionStatement(
                  callRead(extra.reserve!, referenceSectionId)
                )
              );
            } else {
              createElFunction ??= t.identifier(varName + "_getter");
              reference.replaceWith(
                callRuntime(
                  "bind",
                  getScopeExpression(extra.reserve!, referenceSectionId),
                  createElFunction
                )
              );
            }
          }
          if (createElFunction) {
            currentProgramPath.pushContainer(
              "body",
              t.variableDeclaration("const", [
                t.variableDeclarator(
                  createElFunction,
                  t.arrowFunctionExpression(
                    [scopeIdentifier],
                    t.memberExpression(
                      scopeIdentifier,
                      t.numericLiteral(extra.reserve!.id),
                      true
                    )
                  )
                ),
              ])
            );
          }
        }
      }

      let visitIndex: t.NumericLiteral | undefined;
      if (extra.reserve) {
        visitIndex = t.numericLiteral(extra.reserve.id);
        walks.visit(tag, walks.WalkCodes.Get);
      }

      write`<${name.node}`;

      if (hasSpread) {
        const attrsCallExpr = callRuntime(
          "attrs",
          scopeIdentifier,
          attrsToObject(tag)!
        );

        if (isHTML) {
          write`${attrsCallExpr}`;
        } else {
          tag.insertBefore(t.expressionStatement(attrsCallExpr));
        }
      } else {
        // TODO: this should iterate backward and filter out duplicated attrs.
        for (const attr of attrs as t.NodePath<t.MarkoAttribute>[]) {
          const name = attr.node.name;
          const extra = attr.node.extra ?? {};
          const value = attr.get("value");
          const { confident, computed, valueReferences } = extra;

          switch (name) {
            case "class":
            case "style": {
              const helper = `${name}Attr` as "classAttr" | "styleAttr";
              if (confident) {
                write`${getHTMLRuntime()[helper](computed)}`;
              } else if (isHTML) {
                write`${callRuntime(helper, value.node)}`;
              } else {
                addStatement(
                  "apply",
                  sectionId,
                  valueReferences,
                  t.expressionStatement(
                    callRuntime(
                      helper,
                      t.memberExpression(scopeIdentifier, visitIndex!, true),
                      value.node
                    )
                  )
                );
              }
              break;
            }
            default:
              if (confident) {
                write`${getHTMLRuntime().attr(name, computed)}`;
              } else if (isHTML) {
                if (isEventHandler(name)) {
                  addHTMLHydrateCall(sectionId, valueReferences);
                } else {
                  write`${callRuntime(
                    "attr",
                    t.stringLiteral(name),
                    value.node
                  )}`;
                }
              } else if (isEventHandler(name)) {
                addStatement(
                  "hydrate",
                  sectionId,
                  valueReferences,
                  t.expressionStatement(
                    callRuntime(
                      "on",
                      t.memberExpression(scopeIdentifier, visitIndex!, true),
                      t.stringLiteral(getEventHandlerName(name)),
                      value.node
                    )
                  )
                );
              } else {
                addStatement(
                  "apply",
                  sectionId,
                  valueReferences,
                  t.expressionStatement(
                    callRuntime(
                      "attr",
                      t.memberExpression(scopeIdentifier, visitIndex!, true),
                      t.stringLiteral(name),
                      value.node
                    )
                  )
                );
              }

              break;
          }
        }
      }

      let emptyBody = false;

      if (tagDef && tagDef.parseOptions?.openTagOnly) {
        switch (tagDef.htmlType) {
          case "svg":
          case "math":
            write`/>`;
            break;
          default:
            write`>`;
            break;
        }

        emptyBody = true;
      } else if (tag.node.body.body.length) {
        write`>`;
      } else {
        write`></${name.node}>`;
        emptyBody = true;
      }

      if (isHTML && extra.tagNameNullable) {
        tag
          .insertBefore(t.ifStatement(name.node, writer.consumeHTML(tag)!))[0]
          .skip();
      }

      if (emptyBody) {
        walks.enterShallow(tag);
        tag.remove();
      } else {
        walks.enter(tag);
      }
    },
    exit(tag: t.NodePath<t.MarkoTag>) {
      const { extra } = tag.node;
      const isHTML = isOutputHTML();

      if (isHTML && extra.tagNameNullable) {
        writer.flushInto(tag);
      }

      tag.insertBefore(tag.node.body.body).forEach((child) => child.skip());

      writer.writeTo(tag)`</${tag.node.name}>`;

      if (isHTML && extra.tagNameNullable) {
        tag
          .insertBefore(
            t.ifStatement(tag.node.name, writer.consumeHTML(tag)!)
          )[0]
          .skip();
      }

      walks.exit(tag);
      tag.remove();
    },
  },
};

function isSpreadAttr(
  attr: t.NodePath<t.MarkoAttribute | t.MarkoSpreadAttribute>
): attr is t.NodePath<t.MarkoAttribute> {
  return attr.type === "MarkoSpreadAttribute";
}

function isEventHandler(propName: string) {
  return /^on[A-Z-]/.test(propName);
}

function getEventHandlerName(propName: string) {
  return propName.charAt(2) === "-"
    ? propName.slice(3)
    : propName.charAt(2).toLowerCase() + propName.slice(3);
}
