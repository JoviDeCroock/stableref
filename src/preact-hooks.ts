import type * as Preact from "preact";
import * as PreactHooks from "preact/hooks";
import type { Stable } from "./core.js";
import type { CheckedDeps } from "./strict-deps.js";

type Dispatch<A> = (value: A) => void;
type StateUpdater<S> = S | ((previousState: S) => S);
type EffectCallback = () => void | (() => void);
type StrictEffectHook = {
  (effect: EffectCallback): void;
  (effect: EffectCallback, inputs: undefined): void;
  <const D extends readonly unknown[]>(
    effect: EffectCallback,
    inputs: CheckedDeps<D>,
  ): void;
};

type StrictImperativeHandle = {
  <T, R extends T>(ref: Preact.Ref<T>, create: () => R): void;
  <T, R extends T>(
    ref: Preact.Ref<T>,
    create: () => R,
    inputs: undefined,
  ): void;
  <T, R extends T, const D extends readonly unknown[]>(
    ref: Preact.Ref<T>,
    create: () => R,
    inputs: CheckedDeps<D>,
  ): void;
};

export const useMemo = PreactHooks.useMemo as <
  T,
  const D extends readonly unknown[],
>(
  factory: () => T,
  inputs: CheckedDeps<D>,
) => Stable<T>;

export const useCallback = PreactHooks.useCallback as <
  F extends (...args: any[]) => any,
  const D extends readonly unknown[],
>(
  callback: F,
  inputs: CheckedDeps<D>,
) => Stable<F>;

export const useEffect = PreactHooks.useEffect as StrictEffectHook;
export const useLayoutEffect = PreactHooks.useLayoutEffect as StrictEffectHook;
export const useImperativeHandle =
  PreactHooks.useImperativeHandle as StrictImperativeHandle;

type StrictStateHook = {
  <S>(
    initialState: S | (() => S),
  ): [Stable<S>, Stable<Dispatch<StateUpdater<S>>>];
  <S = undefined>(): [
    Stable<S | undefined>,
    Stable<Dispatch<StateUpdater<S | undefined>>>,
  ];
};

export const useState: StrictStateHook =
  PreactHooks.useState as StrictStateHook;

type StrictReducerHook = {
  <S, A>(
    reducer: PreactHooks.Reducer<S, A>,
    initialState: S,
  ): [Stable<S>, Stable<Dispatch<A>>];
  <S, A, I>(
    reducer: PreactHooks.Reducer<S, A>,
    initialArg: I,
    init: (arg: I) => S,
  ): [Stable<S>, Stable<Dispatch<A>>];
};

export const useReducer: StrictReducerHook =
  PreactHooks.useReducer as StrictReducerHook;

type StrictRefHook = {
  <T>(initialValue: T): Stable<{ current: T }>;
  <T>(initialValue: T | null): Stable<Preact.RefObject<T>>;
  <T = undefined>(): Stable<{ current: T | undefined }>;
};

export const useRef: StrictRefHook = PreactHooks.useRef as StrictRefHook;
