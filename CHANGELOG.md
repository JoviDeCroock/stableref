# stableref

## 0.2.0

### Minor Changes

- [#12](https://github.com/JoviDeCroock/stableref/pull/12) [`dbf3304`](https://github.com/JoviDeCroock/stableref/commit/dbf3304197dbdf3aded5d22b9ba1df3581607d8b) Thanks [@JoviDeCroock](https://github.com/JoviDeCroock)! - Export React's original useSyncExternalStore hook with branded snapshot results and a stable subscription contract. Document snapshot caching and hydration obligations.

### Patch Changes

- [`c687189`](https://github.com/JoviDeCroock/stableref/commit/c687189d30ae4bef7e2f5c31e2164dc4fdcce12f) Thanks [@JoviDeCroock](https://github.com/JoviDeCroock)! - Document how stableref's type-level stability contracts interact with React Compiler optimization, hook recognition, and exhaustive dependency linting.

- [#4](https://github.com/JoviDeCroock/stableref/pull/4) [`a848023`](https://github.com/JoviDeCroock/stableref/commit/a848023078da70bf4a3b18aef10f10ebfbaa61e1) Thanks [@ayden94](https://github.com/ayden94)! - Support ordinary explicit type arguments for strict React and Preact `useMemo<T>`, `useCallback<F>`, and `useImperativeHandle<T, R>` calls by defaulting the dependency type to `StableDeps`.

  Explicit calls still reject unproven reference dependencies, with diagnostics against `StableDependency`. Inferred calls retain the existing actionable dependency diagnostics. Hook identity and stability branding are unchanged.

- [#5](https://github.com/JoviDeCroock/stableref/pull/5) [`17a99ea`](https://github.com/JoviDeCroock/stableref/commit/17a99eab5c7e52d1b803d29771a4a17a4b651690) Thanks [@ayden94](https://github.com/ayden94)! - Preserve mutable initialized refs and precise current-value types with React 18 declarations while retaining React 19 compatibility and branding only the ref container.

- [#10](https://github.com/JoviDeCroock/stableref/pull/10) [`14f1b55`](https://github.com/JoviDeCroock/stableref/commit/14f1b550f50d4d5d8294715945f97c5800b4ad17) Thanks [@ayden94](https://github.com/ayden94)! - Accept optional stable dependency lists in the strict React and Preact effect and imperative handle hooks while continuing to reject unproven reference dependencies.
