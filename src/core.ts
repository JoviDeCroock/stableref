import type { stableBrand } from "./internal.js";

/** A JavaScript primitive, whose equality is already value-based. */
export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

type StableMarker = {
  readonly [stableBrand]: true;
};

/**
 * Proof that an object or function has a stable identity. Primitives pass
 * through unchanged because React and Preact compare them by value.
 */
export type Stable<T> = T extends object ? T & StableMarker : T;

/** A value that is safe to put in a hook dependency list. */
export type StableDependency = Primitive | (object & StableMarker);

/** A dependency list containing only primitives or proven-stable references. */
export type StableDeps = readonly StableDependency[];

/**
 * Bless a value whose lifetime is already stable, such as a module-scope
 * constant. Calls should remain at module scope.
 */
export function stable<const T>(value: T): Stable<T> {
  return value as Stable<T>;
}
