import { createContext, type Context } from "react";
import type { Stable } from "./core.js";

/** A context whose provider and consumers agree that its value is stable. */
export type StableContext<T> = Context<Stable<T>>;

/** Create a context whose Provider rejects unbranded reference values. */
export function createStableContext<T>(defaultValue: Stable<T>): StableContext<T> {
  return createContext(defaultValue);
}
