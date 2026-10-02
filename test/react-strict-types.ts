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
