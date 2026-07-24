# Project guidance

- Keep the stability brand private and phantom; do not export `stableBrand` through the package export map.
- `stableref/react` and `stableref/preact` export the frameworks' original hook references with strict dependency signatures. Do not turn them into wrapper functions.
- The root entry augments React as an optional convenience mode. Module augmentation cannot remove framework overloads and is not the strict enforcement path.
- Hook initializer closures are not dependency lists. Do not require `Stable<T>` proof for `useState` or `useReducer` initializers.
- `stable()` must remain an identity function and is intended only for module-scope values.
- Run `pnpm check` after changing public types or hook declarations.
- Add a changeset under `.changeset/` when a change affects the published package.
