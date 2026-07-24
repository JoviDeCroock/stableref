import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: [
    "src/index.ts",
    "src/react.ts",
    "src/preact.ts",
  ],
  format: "esm",
  dts: true,
  deps: {
    neverBundle: ["preact", "react"],
  },
});
