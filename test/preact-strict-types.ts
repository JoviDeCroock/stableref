import {
  stable,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Stable,
  type StableDeps,
} from "../src/preact.js";

function expectType<T>(_value: T): void {}

type Model = { id: number };
const proven = stable<Model>({ id: 1 });
const raw: Model = { id: 2 };
const stableDependencies = [proven, "primitive", 1] as const;
const rawCallback = () => raw.id;
const rawArray = [1, 2];
declare const maybeStable: Model | Stable<Model>;

expectType<Stable<Model>>(useMemo(() => ({ id: 3 }), [proven]));
expectType<Stable<Model>>(useMemo<Model>(() => raw, []));
expectType<Stable<Model>>(useMemo<Model>(() => raw, [1, "primitive"]));
expectType<Stable<Model>>(useMemo<Model>(() => raw, stableDependencies));
// @ts-expect-error Explicit result types still require proven reference dependencies.
useMemo<Model>(() => raw, [raw]);
// @ts-expect-error Raw arrays are references, not primitive dependencies.
useMemo<Model>(() => raw, [rawArray]);
// @ts-expect-error Every member of a dependency union must be stable.
useMemo<Model>(() => raw, [maybeStable]);
// @ts-expect-error Strict Preact hooks reject raw reference dependencies.
useMemo(() => ({ id: 3 }), [raw]);

expectType<Stable<() => number>>(useCallback(() => proven.id, [proven]));
type ModelCallback = (id: number) => Model;
const explicitCallback = useCallback<ModelCallback>((id) => ({ id }), stableDependencies);
expectType<Stable<ModelCallback>>(explicitCallback);
expectType<Stable<ModelCallback>>(useCallback<ModelCallback>((id) => ({ id }), []));
expectType<Stable<ModelCallback>>(useCallback<ModelCallback>((id) => ({ id }), [1]));
// @ts-expect-error Explicit callback types still reject raw object dependencies.
useCallback<ModelCallback>((id) => ({ id }), [raw]);
// @ts-expect-error Functions also require stability proof.
useCallback<ModelCallback>((id) => ({ id }), [rawCallback]);
// @ts-expect-error Explicit callback parameter types are preserved.
explicitCallback("not a number");
// @ts-expect-error Strict Preact callbacks reject raw dependencies.
useCallback(() => raw.id, [raw]);

useEffect(() => {});
useEffect(() => {}, undefined);
useEffect(() => {}, [proven]);
// @ts-expect-error Strict Preact effects reject raw dependencies.
useEffect(() => {}, [raw]);

const setHandle = (_value: Model | null) => {};
useImperativeHandle<Model, Model>(setHandle, () => proven);
useImperativeHandle<Model, Model>(setHandle, () => proven, undefined);
useImperativeHandle<Model, Model>(setHandle, () => proven, []);
useImperativeHandle<Model, Model>(setHandle, () => proven, [1, "primitive"]);
useImperativeHandle<Model, Model>(setHandle, () => proven, stableDependencies);
// @ts-expect-error Imperative handles reject unstable dependency lists.
useImperativeHandle<Model, Model>(setHandle, () => proven, [raw]);
// @ts-expect-error Explicit imperative handles reject unproven functions too.
useImperativeHandle<Model, Model>(setHandle, () => proven, [rawCallback]);
useImperativeHandle(setHandle, () => proven, stableDependencies);
// @ts-expect-error Inferred imperative handles must also reject raw dependencies.
useImperativeHandle(setHandle, () => proven, [raw]);

function useOptionalDependencies(dependencies?: StableDeps) {
  const callback = useCallback(() => proven.id, [proven]);
  const optionalStable = dependencies
    ? ([proven, callback, "primitive", 1, undefined] as const)
    : undefined;
  const optionalEmpty = dependencies ? ([] as const) : undefined;
  const rawCallback = () => raw.id;
  const optionalObject = dependencies ? ([raw] as const) : undefined;
  const optionalFunction = dependencies ? ([rawCallback] as const) : undefined;
  const optionalMixed = dependencies ? ([proven, raw] as const) : undefined;

  for (const effect of [useEffect, useLayoutEffect]) {
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

  useImperativeHandle(setHandle, () => proven);
  useImperativeHandle(setHandle, () => proven, undefined);
  useImperativeHandle(setHandle, () => proven, []);
  useImperativeHandle(setHandle, () => proven, [proven, callback, true]);
  useImperativeHandle(setHandle, () => proven, dependencies);
  useImperativeHandle<Model, Model>(setHandle, () => proven, dependencies);
  useImperativeHandle(setHandle, () => proven, optionalStable);
  useImperativeHandle(setHandle, () => proven, optionalEmpty);
  // @ts-expect-error Inferred imperative handles reject raw object dependencies.
  useImperativeHandle(setHandle, () => proven, [raw]);
  // @ts-expect-error Inferred imperative handles reject raw function dependencies.
  useImperativeHandle(setHandle, () => proven, [rawCallback]);
  // @ts-expect-error Optional imperative handle lists must contain stable objects.
  useImperativeHandle(setHandle, () => proven, optionalObject);
  // @ts-expect-error Explicit handle types must also reject optional raw lists.
  useImperativeHandle<Model, Model>(setHandle, () => proven, optionalObject);
  // @ts-expect-error Optional imperative handle lists must contain stable functions.
  useImperativeHandle(setHandle, () => proven, optionalFunction);
  // @ts-expect-error Stable entries cannot hide an unstable optional dependency.
  useImperativeHandle(setHandle, () => proven, optionalMixed);

  // @ts-expect-error Memoization still requires a dependency list.
  useMemo(() => proven, optionalStable);
  // @ts-expect-error Callback memoization still requires a dependency list.
  useCallback(() => proven, optionalStable);
}

const [state, setState] = useState<Model>(() => raw);
expectType<Stable<Model>>(state);
expectType<
  Stable<(value: Model | ((previousState: Model) => Model)) => void>
>(setState);

const [reduced, dispatch] = useReducer(
  (current: Model, id: number) => ({ id: current.id + id }),
  { id: 0 },
);
expectType<Stable<Model>>(reduced);
expectType<Stable<(value: number) => void>>(dispatch);

const [initialized] = useReducer(
  (current: Model, id: number) => ({ id: current.id + id }),
  raw,
  (initial) => ({ id: initial.id + raw.id }),
);
expectType<Stable<Model>>(initialized);

const ref = useRef<Model | null>(null);
expectType<Stable<{ current: Model | null }>>(ref);
