import * as React from "react";
import type { Stable, StableDeps } from "./core.js";
import type { CheckedDeps } from "./strict-deps.js";

type StrictEffectHook = {
  (effect: React.EffectCallback): void;
  (effect: React.EffectCallback, dependencies: undefined): void;
  <const D extends readonly unknown[]>(
    effect: React.EffectCallback,
    dependencies: CheckedDeps<D> | undefined,
  ): void;
};

type StrictImperativeHandle = {
  <T, R extends T>(ref: React.Ref<T> | undefined, init: () => R): void;
  <T, R extends T>(
    ref: React.Ref<T> | undefined,
    init: () => R,
    dependencies: undefined,
  ): void;
  <T, R extends T, const D extends readonly unknown[] = StableDeps>(
    ref: React.Ref<T> | undefined,
    init: () => R,
    dependencies: CheckedDeps<D> | undefined,
  ): void;
};

/** The original React hook reference with a proof-producing signature. */
export const useMemo = React.useMemo as <
  T,
  const D extends readonly unknown[] = StableDeps,
>(
  factory: () => T,
  dependencies: CheckedDeps<D>,
) => Stable<T>;

/** The original React hook reference with a proof-producing signature. */
export const useCallback = React.useCallback as <
  F extends (...args: any[]) => any,
  const D extends readonly unknown[] = StableDeps,
>(
  callback: F,
  dependencies: CheckedDeps<D>,
) => Stable<F>;

/** Effects without a list still run every render; supplied lists are checked. */
export const useEffect = React.useEffect as StrictEffectHook;
export const useLayoutEffect = React.useLayoutEffect as StrictEffectHook;
export const useInsertionEffect = React.useInsertionEffect as StrictEffectHook;
export const useImperativeHandle =
  React.useImperativeHandle as StrictImperativeHandle;

type StrictStateHook = {
  <S>(
    initialState: S | (() => S),
  ): [Stable<S>, Stable<React.Dispatch<React.SetStateAction<S>>>];
  <S = undefined>(): [
    Stable<S | undefined>,
    Stable<React.Dispatch<React.SetStateAction<S | undefined>>>,
  ];
};

export const useState: StrictStateHook = React.useState as StrictStateHook;

type StrictReducerHook = {
  <S>(
    reducer: React.ReducerWithoutAction<S>,
    initialState: S,
  ): [Stable<S>, Stable<React.DispatchWithoutAction>];
  <S, I>(
    reducer: React.ReducerWithoutAction<S>,
    initialArg: I,
    init: (arg: I) => S,
  ): [Stable<S>, Stable<React.DispatchWithoutAction>];
  <S, A>(
    reducer: React.Reducer<S, A>,
    initialState: S,
  ): [Stable<S>, Stable<React.Dispatch<A>>];
  <S, I, A>(
    reducer: React.Reducer<S, A>,
    initialArg: I,
    init: (arg: I) => S,
  ): [Stable<S>, Stable<React.Dispatch<A>>];
};

export const useReducer: StrictReducerHook =
  React.useReducer as StrictReducerHook;

type StrictRefHook = {
  <T>(initialValue: T): Stable<{ current: T }>;
  <T>(initialValue: T | null): Stable<React.RefObject<T | null>>;
  <T>(initialValue: T | undefined): Stable<{ current: T | undefined }>;
};

// Keep React 18's native overloads compatible with the assertion, but expose
// only the strict signature so unbranded return types cannot escape.
export const useRef: StrictRefHook =
  React.useRef as typeof React.useRef & StrictRefHook;

export const useTransition = React.useTransition as () => [
  boolean,
  Stable<React.TransitionStartFunction>,
];
