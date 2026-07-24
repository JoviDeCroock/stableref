import { createContext, type Context } from "preact";
import type { Stable } from "./core.js";

/** A Preact context whose provider only accepts stable values. */
export type StableContext<T> = Context<Stable<T>>;

/** Create a Preact context whose Provider rejects unbranded reference values. */
export function createStableContext<T>(defaultValue: Stable<T>): StableContext<T> {
  return createContext(defaultValue);
}
