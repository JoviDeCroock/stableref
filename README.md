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

The brand is compile-time only. The strict exports add a small re-export module, but preserve the original React and Preact hook identities and add no wrapper calls.
