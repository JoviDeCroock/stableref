import type { StableDependency } from "./core.js";

/**
 * Message surfaced in place of an unproven dependency. Because it is a string
 * literal type, TypeScript prints it verbatim in the assignability error, which
 * turns the diagnostic into actionable guidance for humans and coding agents.
 */
type UnstableDependency =
  "This dependency is not Stable<T>: memoize it with useMemo/useCallback, source it from useState, depend on a useRef container rather than its mutable current value, or wrap a module-scope constant with stable().";

/**
 * Preserve an inferred dependency tuple while rejecting unproven references.
 * Each unproven element is mapped to `UnstableDependency` so the resulting type
 * error names the fix instead of failing against `never`.
 */
export type CheckedDeps<D extends readonly unknown[]> = {
  readonly [K in keyof D]: D[K] extends StableDependency
    ? D[K]
    : UnstableDependency;
};
