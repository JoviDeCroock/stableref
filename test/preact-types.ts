import {
  createStableContext,
  stable,
  type Stable,
} from "../src/preact.js";
import { useMemo } from "preact/hooks";

function expectType<T>(_value: T): void {}

type Model = { id: number };
const stableModel = stable<Model>({ id: 1 });

const directMemo = useMemo(() => ({ id: 2 }), [stableModel]);
// The package does not augment hooks imported directly from Preact.
// @ts-expect-error Direct Preact hooks do not produce branded results.
expectType<Stable<Model>>(directMemo);

const ModelContext = createStableContext<Model>(stableModel);
const validProviderProps: Parameters<typeof ModelContext.Provider>[0] = {
  value: stableModel,
  children: null,
};
void validProviderProps;

const invalidProviderProps: Parameters<typeof ModelContext.Provider>[0] = {
  // @ts-expect-error Stable contexts reject raw provider values.
  value: { id: 3 },
  children: null,
};
void invalidProviderProps;
