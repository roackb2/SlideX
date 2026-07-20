import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AuthorizationButtons,
  submitAuthorizationDecision
} from "./AuthorizationActions";

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

test("OAuth decisions synchronously submit the original form with the clicked button", () => {
  const calls: string[] = [];
  const button = {
    form: {
      requestSubmit(submitter: unknown) {
        assert.equal(submitter, button);
        calls.push("submit");
      }
    }
  };

  submitAuthorizationDecision({
    currentDecision: null,
    event: {
      currentTarget: button as HTMLButtonElement,
      preventDefault() {
        calls.push("preventDefault");
      }
    },
    nextDecision: "allow",
    setDecision(decision) {
      assert.equal(decision, "allow");
      calls.push("setDecision");
    }
  });

  assert.deepEqual(calls, ["preventDefault", "setDecision", "submit"]);
});

test("OAuth decisions cannot submit twice while a redirect is pending", () => {
  let submitted = false;

  submitAuthorizationDecision({
    currentDecision: "allow",
    event: {
      currentTarget: {
        form: {
          requestSubmit() {
            submitted = true;
          }
        }
      } as unknown as HTMLButtonElement,
      preventDefault() {}
    },
    nextDecision: "allow",
    setDecision() {}
  });

  assert.equal(submitted, false);
});
