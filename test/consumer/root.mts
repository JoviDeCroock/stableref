import {
  stable,
  type Primitive,
  type Stable,
  type StableDependency,
  type StableDeps,
} from "stableref";

function expectType<T>(_value: T): void {}

const proven = stable({ id: 1 });
expectType<Stable<{ id: number }>>(proven);
expectType<Primitive>("primitive");
expectType<StableDependency>(proven);
expectType<StableDeps>([proven, 1, null]);
expectType<Stable<number>>(1);

// @ts-expect-error Raw references cannot forge the private stability proof.
expectType<Stable<{ id: number }>>({ id: 1 });
// @ts-expect-error Dependency lists require proven references.
expectType<StableDeps>([{ id: 1 }]);
