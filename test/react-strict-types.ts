import type { Dispatch, DispatchWithoutAction, SetStateAction } from "react";
import {
  stable,
  useCallback,
  useEffect,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Stable,
  type StableDeps,
} from "../src/react.js";

function expectType<T>(_value: T): void {}

type Model = { id: number };
const proven = stable<Model>({ id: 1 });
const raw: Model = { id: 2 };

const memoized = useMemo(() => ({ id: 3 }), [proven, "primitive", 1]);
expectType<Stable<Model>>(memoized);

// @ts-expect-error Strict hooks reject unproven reference dependencies immediately.
useMemo(() => ({ id: 3 }), [raw]);

const callback = useCallback(() => proven.id, [proven]);
expectType<Stable<() => number>>(callback);

// @ts-expect-error Callbacks use the same strict dependency contract.
useCallback(() => raw.id, [raw]);

useEffect(() => {});
useEffect(() => {}, undefined);
useEffect(() => {}, [proven, true]);
// @ts-expect-error Effects reject unstable lists even though their result is unused.
useEffect(() => {}, [raw]);

useImperativeHandle<Model, Model>(undefined, () => proven, undefined);
// @ts-expect-error Imperative handles reject unstable dependency lists.
useImperativeHandle<Model, Model>(undefined, () => proven, [raw]);

function useOptionalDependencies(dependencies?: StableDeps) {
  const optionalStable = dependencies
    ? ([proven, callback, "primitive", 1, undefined] as const)
    : undefined;
  const optionalEmpty = dependencies ? ([] as const) : undefined;
  const rawCallback = () => raw.id;
  const optionalObject = dependencies ? ([raw] as const) : undefined;
  const optionalFunction = dependencies ? ([rawCallback] as const) : undefined;
  const optionalMixed = dependencies ? ([proven, raw] as const) : undefined;

  for (const effect of [useEffect, useLayoutEffect, useInsertionEffect]) {
    effect(() => {});
    effect(() => {}, undefined);
    effect(() => {}, []);
    effect(() => {}, [proven, callback, true]);
    effect(() => {}, dependencies);
    effect(() => {}, optionalStable);
    effect(() => {}, optionalEmpty);
    // @ts-expect-error Effects reject raw object dependencies.
    effect(() => {}, [raw]);
    // @ts-expect-error Effects reject raw function dependencies.
    effect(() => {}, [rawCallback]);
    // @ts-expect-error An optional list still needs stable object dependencies.
    effect(() => {}, optionalObject);
    // @ts-expect-error An optional list still needs stable function dependencies.
    effect(() => {}, optionalFunction);
    // @ts-expect-error Every dependency in an optional tuple must be stable.
    effect(() => {}, optionalMixed);
  }

  useImperativeHandle(undefined, () => proven);
  useImperativeHandle(undefined, () => proven, undefined);
  useImperativeHandle(undefined, () => proven, []);
  useImperativeHandle(undefined, () => proven, [proven, callback, true]);
  useImperativeHandle(undefined, () => proven, dependencies);
  useImperativeHandle(undefined, () => proven, optionalStable);
  useImperativeHandle(undefined, () => proven, optionalEmpty);
  // @ts-expect-error Inferred imperative handles reject raw object dependencies.
  useImperativeHandle(undefined, () => proven, [raw]);
  // @ts-expect-error Inferred imperative handles reject raw function dependencies.
  useImperativeHandle(undefined, () => proven, [rawCallback]);
  // @ts-expect-error Optional imperative handle lists must contain stable objects.
  useImperativeHandle(undefined, () => proven, optionalObject);
  // @ts-expect-error Optional imperative handle lists must contain stable functions.
  useImperativeHandle(undefined, () => proven, optionalFunction);
  // @ts-expect-error Stable entries cannot hide an unstable optional dependency.
  useImperativeHandle(undefined, () => proven, optionalMixed);

  // @ts-expect-error Memoization still requires a dependency list.
  useMemo(() => proven, optionalStable);
  // @ts-expect-error Callback memoization still requires a dependency list.
  useCallback(() => proven, optionalStable);
}

const [state, setState] = useState<Model>(() => raw);
expectType<Stable<Model>>(state);
expectType<Stable<Dispatch<SetStateAction<Model>>>>(setState);

const [reduced, dispatch] = useReducer(
  (current: Model, id: number) => ({ id: current.id + id }),
  { id: 0 },
);
expectType<Stable<Model>>(reduced);
expectType<Stable<Dispatch<number>>>(dispatch);

const [, dispatchWithoutAction] = useReducer(
  (current: Model) => ({ id: current.id + 1 }),
  { id: 0 },
);
expectType<Stable<DispatchWithoutAction>>(dispatchWithoutAction);
dispatchWithoutAction();

const [initialized] = useReducer(
  (current: Model, id: number) => ({ id: current.id + id }),
  raw,
  (initial) => ({ id: initial.id + raw.id }),
);
expectType<Stable<Model>>(initialized);

const ref = useRef<Model | null>(null);
expectType<Stable<{ current: Model | null }>>(ref);
