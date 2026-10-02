# Project goal

Follow [Making Referential Stability a Type](https://jovidecroock.com/blog/referential-stability-types/): make referential stability an explicit, composable TypeScript contract across props, contexts, and hook results. Reject unproven reference dependencies at their source with actionable diagnostics, while retaining the frameworks' runtime behavior.

`Stable<T>` describes an identity that survives unrelated renders until its source changes. It does not imply immutability or permanent identity, and application correctness must not depend on memo caches being retained. Brand objects and functions; let primitives pass through.

# Project guidance

- Keep the stability brand private and phantom; do not export `stableBrand` through the package export map.
- `stableref/react` and `stableref/preact` export the frameworks' original hook references with strict dependency signatures. Do not turn them into wrapper functions.
- Keep the root entry framework-neutral: shared types and `stable()` only. Do not ship module augmentation; it cannot remove permissive framework overloads.
- Hook initializer closures are not dependency lists. Do not require `Stable<T>` proof for `useState` or `useReducer` initializers.
- `stable()` must remain an identity function and is intended only for module-scope values.
- Keep assertions as explicit escape hatches governed by review and module-scope conventions; an official lint plugin is outside the current scope.
- Brand only ref containers, not mutable `current` values. Any new proof-producing source must document the framework contract and caller obligations that justify it.
- Run `pnpm check` after changing public types or hook declarations.
- Add a changeset under `.changeset/` when a change affects the published package.
