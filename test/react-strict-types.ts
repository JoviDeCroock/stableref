import type { Dispatch, DispatchWithoutAction, SetStateAction } from "react";
import {
  stable,
  createStableContext,
  useCallback,
  useEffect,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type Stable,
  type StableDeps,
} from "../src/react.js";

function expectType<T>(_value: T): void {}

type Model = { id: number };
const proven = stable<Model>({ id: 1 });
const raw: Model = { id: 2 };
const stableDependencies = [proven, "primitive", 1] as const;
const rawCallback = () => raw.id;
const rawArray = [1, 2];
declare const maybeStable: Model | Stable<Model>;

const memoized = useMemo(() => ({ id: 3 }), [proven, "primitive", 1]);
expectType<Stable<Model>>(memoized);

expectType<Stable<Model>>(useMemo<Model>(() => raw, []));
expectType<Stable<Model>>(useMemo<Model>(() => raw, [1, "primitive"]));
expectType<Stable<Model>>(useMemo<Model>(() => raw, stableDependencies));
// @ts-expect-error Explicit result types still require proven reference dependencies.
useMemo<Model>(() => raw, [raw]);
// @ts-expect-error Raw arrays are references, not primitive dependencies.
useMemo<Model>(() => raw, [rawArray]);
// @ts-expect-error Every member of a dependency union must be stable.
useMemo<Model>(() => raw, [maybeStable]);

// @ts-expect-error Strict hooks reject unproven reference dependencies immediately.
useMemo(() => ({ id: 3 }), [raw]);

const callback = useCallback(() => proven.id, [proven]);
expectType<Stable<() => number>>(callback);

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

// @ts-expect-error Callbacks use the same strict dependency contract.
useCallback(() => raw.id, [raw]);

useEffect(() => {});
useEffect(() => {}, undefined);
useEffect(() => {}, [proven, true]);
// @ts-expect-error Effects reject unstable lists even though their result is unused.
useEffect(() => {}, [raw]);

useImperativeHandle<Model, Model>(undefined, () => proven);
useImperativeHandle<Model, Model>(undefined, () => proven, undefined);
useImperativeHandle<Model, Model>(undefined, () => proven, []);
useImperativeHandle<Model, Model>(undefined, () => proven, [1, "primitive"]);
useImperativeHandle<Model, Model>(undefined, () => proven, stableDependencies);
// @ts-expect-error Imperative handles reject unstable dependency lists.
useImperativeHandle<Model, Model>(undefined, () => proven, [raw]);
// @ts-expect-error Explicit imperative handles reject unproven functions too.
useImperativeHandle<Model, Model>(undefined, () => proven, [rawCallback]);
useImperativeHandle(undefined, () => proven, stableDependencies);
// @ts-expect-error Inferred imperative handles must also reject raw dependencies.
useImperativeHandle(undefined, () => proven, [raw]);

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
  useImperativeHandle<Model, Model>(undefined, () => proven, dependencies);
  useImperativeHandle(undefined, () => proven, optionalStable);
  useImperativeHandle(undefined, () => proven, optionalEmpty);
  // @ts-expect-error Inferred imperative handles reject raw object dependencies.
  useImperativeHandle(undefined, () => proven, [raw]);
  // @ts-expect-error Inferred imperative handles reject raw function dependencies.
  useImperativeHandle(undefined, () => proven, [rawCallback]);
  // @ts-expect-error Optional imperative handle lists must contain stable objects.
  useImperativeHandle(undefined, () => proven, optionalObject);
  // @ts-expect-error Explicit handle types must also reject optional raw lists.
  useImperativeHandle<Model, Model>(undefined, () => proven, optionalObject);
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
ref.current = raw;
ref.current = null;

const initializedRef = useRef(raw);
expectType<Model>(initializedRef.current);
initializedRef.current = { id: 3 };
useEffect(() => {}, [initializedRef]);
// @ts-expect-error Only the ref object, not its mutable contents, is stable.
expectType<Stable<Model>>(initializedRef.current);
// @ts-expect-error Mutable ref contents are not proven-stable dependencies.
useEffect(() => {}, [initializedRef.current]);
// @ts-expect-error Non-null initialization does not add null.
initializedRef.current = null;
// @ts-expect-error Non-null initialization does not add undefined.
initializedRef.current = undefined;

const numberRef = useRef(0);
expectType<number>(numberRef.current);
numberRef.current = 1;

const nullRef = useRef(null);
expectType<null>(nullRef.current);
nullRef.current = null;
// @ts-expect-error Inferred null refs do not accept other values.
nullRef.current = raw;

const nullableRef = useRef<Model>(null);
expectType<Model | null>(nullableRef.current);
// @ts-expect-error Nullable initialization does not add undefined.
nullableRef.current = undefined;

const undefinedRef = useRef(undefined);
expectType<undefined>(undefinedRef.current);
undefinedRef.current = undefined;
// @ts-expect-error Inferred undefined refs do not accept other values.
undefinedRef.current = 1;

const optionalRef = useRef<number>(undefined);
expectType<number | undefined>(optionalRef.current);
optionalRef.current = 1;
optionalRef.current = undefined;
// @ts-expect-error Undefined initialization does not add null.
optionalRef.current = null;

const explicitOptionalRef = useRef<Model | undefined>(undefined);
expectType<Model | undefined>(explicitOptionalRef.current);
explicitOptionalRef.current = raw;
explicitOptionalRef.current = undefined;

// @ts-expect-error Strict refs require an initializer, as React 19 does.
useRef();

// External-store snapshots derive their proof from React's snapshot contract.
const subscribe = stable((_notify: () => void) => () => {});
const snapshot = { id: 1 };
const getSnapshot = () => snapshot;
expectType<Stable<Model>>(useSyncExternalStore(subscribe, getSnapshot));
expectType<Stable<Model>>(useSyncExternalStore<Model>(subscribe, getSnapshot));
expectType<Stable<Model>>(useSyncExternalStore(subscribe, getSnapshot, undefined));
expectType<Stable<Model>>(useSyncExternalStore(subscribe, getSnapshot, () => snapshot));
expectType<number>(useSyncExternalStore(subscribe, () => 1));
expectType<Stable<Model> | null>(useSyncExternalStore(subscribe, (): Model | null => snapshot));
useEffect(() => {}, [useSyncExternalStore(subscribe, getSnapshot)]);
const StoreContext = createStableContext<Model>(stable({ id: 0 }));
const storeProvider: Parameters<typeof StoreContext.Provider>[0] = {
  value: useSyncExternalStore(subscribe, getSnapshot),
  children: null,
};
void storeProvider;
// @ts-expect-error Subscription identity must be proven to avoid resubscriptions.
useSyncExternalStore((_notify: () => void) => () => {}, getSnapshot);
// @ts-expect-error Subscriptions must return an unsubscribe function.
useSyncExternalStore(stable((_notify: () => void) => {}), getSnapshot);
// @ts-expect-error Subscriptions receive a notification callback, not a number.
useSyncExternalStore(stable((_notify: number) => () => {}), getSnapshot);
// @ts-expect-error Snapshot getters have no required arguments.
useSyncExternalStore(subscribe, (id: number) => ({ id }));
// @ts-expect-error Server snapshots must match the client snapshot type.
useSyncExternalStore(subscribe, getSnapshot, () => "different shape");
// @ts-expect-error Server getters cannot require arguments.
useSyncExternalStore(subscribe, getSnapshot, (id: number) => ({ id }));
