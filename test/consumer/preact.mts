import { stable, type Stable } from "stableref";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Stable as PreactStable,
} from "stableref/preact";

function expectType<T>(_value: T): void {}

const proven = stable({ id: 1 });
const raw = { id: 2 };
expectType<PreactStable<{ id: number }>>(proven);
expectType<Stable<{ id: number }>>(useMemo(() => raw, [proven, 1]));
expectType<Stable<() => number>>(useCallback(() => proven.id, [proven]));
const [state, setState] = useState(() => raw);
expectType<Stable<{ id: number }>>(state);
useEffect(() => {}, [state, setState]);

// @ts-expect-error Packed hook declarations must reject unproven dependencies.
useMemo(() => raw, [raw]);
// @ts-expect-error Packed callbacks keep the strict dependency contract.
useCallback(() => raw.id, [raw]);
// @ts-expect-error Effects reject raw references even when their result is unused.
useEffect(() => {}, [raw]);
