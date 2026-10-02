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
