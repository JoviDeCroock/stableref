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
