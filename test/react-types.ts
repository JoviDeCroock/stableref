import {
  stable,
  type Stable,
  type StableDeps,
} from "../src/index.js";
import * as RootEntry from "../src/index.js";
import { createStableContext } from "../src/react.js";
import { useMemo } from "react";

function expectType<T>(_value: T): void {}

// @ts-expect-error Framework-specific context helpers are not exported at root.
RootEntry.createStableContext;

type Model = { id: number };
type Props = {
  model: Stable<Model>;
  title: string;
};

const primitive: Stable<string> = "title";
expectType<string>(primitive);

// @ts-expect-error Reference values need proof.
const forgedByAssignment: Stable<Model> = { id: 1 };
void forgedByAssignment;

const EMPTY_MODELS = stable([] as Model[]);
expectType<Stable<Model[]>>(EMPTY_MODELS);

const stableModel = stable<Model>({ id: 1 });
const directMemo = useMemo(() => ({ id: 2 }), [stableModel]);
// The package does not augment hooks imported directly from React.
// @ts-expect-error Direct React hooks do not produce branded results.
expectType<Stable<Model>>(directMemo);

const props: Props = { model: stableModel, title: "Example" };
void props;

// @ts-expect-error Raw references cannot cross a Stable prop boundary.
const unstableProps: Props = { model: { id: 2 }, title: "Example" };
void unstableProps;

const dependencies = [stableModel, "primitive", 1] satisfies StableDeps;
void dependencies;

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
