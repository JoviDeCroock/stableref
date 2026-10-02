import type { Dispatch, DispatchWithoutAction, SetStateAction } from "react";
import {
  stable,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Stable,
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
