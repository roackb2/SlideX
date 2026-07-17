import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AuthorizationButtons } from "./AuthorizationActions";

test("OAuth loading UI keeps native submit buttons enabled for the redirect POST", () => {
  const html = renderToStaticMarkup(createElement(AuthorizationButtons, {
    decision: "allow",
    onDecision: () => undefined
  }));

  assert.doesNotMatch(html, /\sdisabled(?:=|\s|>)/);
  assert.match(html, /name="decision"/);
  assert.match(html, /value="allow"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /Allowing access…/);
});
