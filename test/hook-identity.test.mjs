import assert from "node:assert/strict";
import test from "node:test";
import * as PreactHooks from "preact/hooks";
import * as React from "react";
import * as Root from "../dist/index.mjs";
import * as StrictPreact from "../dist/preact.mjs";
import * as StrictReact from "../dist/react.mjs";

test("framework-specific context helpers are absent from the root entry", () => {
  assert.equal("createStableContext" in Root, false);
});

test("strict React hooks preserve the original function references", () => {
  assert.equal(StrictReact.useMemo, React.useMemo);
  assert.equal(StrictReact.useCallback, React.useCallback);
  assert.equal(StrictReact.useEffect, React.useEffect);
  assert.equal(StrictReact.useLayoutEffect, React.useLayoutEffect);
  assert.equal(StrictReact.useInsertionEffect, React.useInsertionEffect);
  assert.equal(StrictReact.useImperativeHandle, React.useImperativeHandle);
  assert.equal(StrictReact.useState, React.useState);
  assert.equal(StrictReact.useReducer, React.useReducer);
  assert.equal(StrictReact.useRef, React.useRef);
  assert.equal(StrictReact.useTransition, React.useTransition);
});

test("strict Preact hooks preserve the original function references", () => {
  assert.equal(StrictPreact.useMemo, PreactHooks.useMemo);
  assert.equal(StrictPreact.useCallback, PreactHooks.useCallback);
  assert.equal(StrictPreact.useEffect, PreactHooks.useEffect);
  assert.equal(StrictPreact.useLayoutEffect, PreactHooks.useLayoutEffect);
  assert.equal(StrictPreact.useImperativeHandle, PreactHooks.useImperativeHandle);
  assert.equal(StrictPreact.useState, PreactHooks.useState);
  assert.equal(StrictPreact.useReducer, PreactHooks.useReducer);
  assert.equal(StrictPreact.useRef, PreactHooks.useRef);
});
