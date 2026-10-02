---
"stableref": patch
---

Support ordinary explicit type arguments for strict React and Preact `useMemo<T>`, `useCallback<F>`, and `useImperativeHandle<T, R>` calls by defaulting the dependency type to `StableDeps`.

Explicit calls still reject unproven reference dependencies, with diagnostics against `StableDependency`. Inferred calls retain the existing actionable dependency diagnostics. Hook identity and stability branding are unchanged.
