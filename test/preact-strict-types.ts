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

expectType<Stable<Model>>(useMemo(() => ({ id: 3 }), [proven]));
// @ts-expect-error Strict Preact hooks reject raw reference dependencies.
useMemo(() => ({ id: 3 }), [raw]);

expectType<Stable<() => number>>(useCallback(() => proven.id, [proven]));
// @ts-expect-error Strict Preact callbacks reject raw dependencies.
useCallback(() => raw.id, [raw]);

useEffect(() => {});
useEffect(() => {}, undefined);
useEffect(() => {}, [proven]);
// @ts-expect-error Strict Preact effects reject raw dependencies.
useEffect(() => {}, [raw]);

const setHandle = (_value: Model | null) => {};
useImperativeHandle<Model, Model>(setHandle, () => proven, undefined);
// @ts-expect-error Imperative handles reject unstable dependency lists.
useImperativeHandle<Model, Model>(setHandle, () => proven, [raw]);

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
