# stableref

Proof-carrying referential stability for React and Preact. Objects and functions must carry a private `Stable<T>` brand; primitives pass through unchanged.

```tsx
import { memo } from "react";
import {
  useCallback,
  useMemo,
  type Stable,
} from "stableref/react";

type Item = { id: string };
type ItemListProps = {
  items: Stable<Item[]>;
  onSelect: Stable<(id: string) => void>;
  title: string;
};

const ItemList = memo((props: ItemListProps) => null);

function Screen({ source }: { source: Stable<Item[]> }) {
  const items = useMemo(() => source.filter(Boolean), [source]);
  const onSelect = useCallback((id: string) => console.log(id), []);
  return <ItemList items={items} onSelect={onSelect} title="Items" />;
}
```

The strict entry exports React's original hook references under stronger signatures. There are no wrapper functions and no new hook names. Unproven reference dependencies are immediate type errors, including in effects.

`Stable<T>` is an optimization contract, not a claim of immutability or permanent identity. A stable reference is expected to survive unrelated renders and change when its source is invalidated, such as by a state update or a memo dependency changing. Application correctness must not depend on the reference being retained forever.

## Install

```sh
pnpm add stableref
```

React 18+ or Preact 10.10+, plus TypeScript 5.4+, are peer dependencies.

## Strict React hooks

Import dependency-bearing hooks from the React entry:

```ts
import {
  useCallback,
  useEffect,
  useMemo,
} from "stableref/react";
```

The exported values are identical to React's functions at runtime:

```ts
strictUseMemo === React.useMemo; // true
```

Their signatures require every dependency to be a primitive or carry `Stable<T>` proof:

```ts
const proven = stable({ id: 1 });
const raw = { id: 2 };

useMemo(() => proven.id, [proven]); // Stable<number>
useMemo(() => raw.id, [raw]);
//                         ^ type error

useEffect(sync, [proven]);
useEffect(sync, [raw]);
//               ^ type error
```

When a dependency is unproven, the error is written to be actionable rather than cryptic. Instead of failing against `never`, the offending element is mapped to a string literal that names the fix, and TypeScript prints it verbatim in the diagnostic:

```ts
useMemo(() => raw.id, [raw]);
// Type '{ id: number; }' is not assignable to type
// 'This dependency is not Stable<T>: memoize it with useMemo/useCallback,
//  source it from useState, depend on a useRef container rather than its mutable
//  current value, or wrap a module-scope constant with stable().'
```

The caret lands on the exact dependency, so a human reading it in their editor, or a coding agent reading it out of `tsc`, is told what to do next.

The entry also brands the contracts already supplied by `useState`, `useReducer`, `useRef`, and `useTransition`.

## React Compiler

stableref and the [React Compiler](https://react.dev/learn/react-compiler/introduction) are compatible, but they operate at different layers and provide different guarantees.

| | React Compiler | stableref |
| --- | --- | --- |
| Purpose | Infer build-time memoization for compiled components and hooks | Make referential stability an explicit TypeScript contract |
| Scope | Implementation details in code the compiler successfully optimizes | Props, contexts, hook results, package APIs, and mixed compiled or uncompiled code |
| Proof | Does not add `Stable<T>` to source types | Does not tell the compiler that a value is memoized |
| Fallback | May skip optimization when code cannot be compiled safely | Keeps enforcing its source-level contract regardless of compiler adoption |

TypeScript checks the source before React Compiler transforms it. A value that the compiler would automatically memoize therefore does not acquire the private brand and cannot satisfy a `Stable<T>` boundary. Producing that proof still requires a strict hook, a stable framework source, or a legitimate module-scope `stable()` assertion.

### What the compiler sees

As of React Compiler 1.0, the compiler recognizes built-in hook semantics from imports whose module specifier is `react` or `react-dom`. It sees an import from `stableref/react` before a bundler resolves the re-export, so runtime identity with `React.useMemo` is not enough for built-in recognition. The exported names are treated as custom hooks.

The surrounding component can still be compiled. However, `useMemo` and `useCallback` imported from `stableref/react` remain real React hook calls in the generated program rather than being lowered like direct imports from React. The compiler may conservatively memoize their callbacks, dependency arrays, or consumers around those calls. It may also track stable React values such as refs and state setters more conservatively because their imports came through a third-party module.

This also means that the compiler's special validation for preserving manual React memoization does not currently apply to these re-exported calls. Keep [`react-hooks/exhaustive-deps`](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps) enabled: stableref checks that every dependency you list is proven stable, while the lint checks that every reactive value captured by the callback was actually listed. Import the hooks under their exported names rather than aliases so the lint can recognize them.

### When to use each

For ordinary local values inside a compiler-first application, prefer the compiler's inferred memoization. React recommends using manual `useMemo` and `useCallback` only when more precise control is needed.

Use stableref when the contract itself is valuable: a component prop must arrive stable, a context provider must not churn its subtree, a hook or package API promises stable output, or compiler adoption is partial or differs between consumers. At those boundaries, explicit source-level proof is intentionally required even when the compiler could infer an equivalent optimization internally.

Do not call `stable()` inside a component to brand a value merely because the compiler currently memoizes it. The assertion must remain true when compilation is disabled, skipped, or configured differently.

React Compiler applies only to the React entry. `stableref/preact` is unaffected.

## Package entries

The package root exports only the framework-neutral types and `stable()`. Import hooks and `createStableContext` from `stableref/react` or `stableref/preact`. The package does not augment hooks imported directly from React or Preact because module augmentation cannot remove their permissive dependency signatures.

## Stable sources

### Module constants

`stable` is an identity assertion for values whose lifetime is already stable. Reserve it for module scope:

```ts
import { stable } from "stableref/react";

export const EMPTY_ITEMS = stable([] as Item[]);
```

### Context

`createStableContext` pushes the proof requirement to the provider:

```tsx
import {
  createStableContext,
  type Stable,
} from "stableref/react";

const ThemeContext = createStableContext<Theme | null>(null);

function ThemeProvider({ value }: { value: Stable<Theme> }) {
  return <ThemeContext.Provider value={value} />;
}
```

## Preact

The Preact entry provides the same strict API using Preact's original hook references:

```ts
import {
  useEffect,
  useMemo,
  type Stable,
} from "stableref/preact";
```

Hooks imported directly from `preact/hooks` are unchanged.

## Limitations

Like every TypeScript brand, `Stable<T>` can be bypassed deliberately with a type assertion. The package does not include an ESLint plugin. `stable()` is also an explicit assertion and must be reserved for values whose lifetime really is stable.

The brand is compile-time only. React Compiler does not consume it or produce it, and current compiler analysis does not treat the React entry as a built-in React module. This behavior may change in a future compiler release.

The strict exports add a small re-export module, but preserve the original React and Preact hook identities and add no wrapper calls. Under the current React Compiler, explicit hooks imported through `stableref/react` remain runtime hook calls rather than being erased as compiler-recognized manual memoization.

Memoization must remain an optimization rather than a correctness requirement. React can discard a `useMemo` or `useCallback` cache for specific reasons, and the compiler can skip optimization. Prefer state or refs when a value's lifetime is semantically significant; see React's [`useMemo` caveats](https://react.dev/reference/react/useMemo#caveats).
