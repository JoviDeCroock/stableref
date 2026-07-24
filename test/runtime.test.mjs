import assert from "node:assert/strict";
import test from "node:test";
import { stable } from "../dist/index.mjs";

test("stable is an identity function", () => {
  const value = { id: 1 };
  assert.equal(stable(value), value);
});
