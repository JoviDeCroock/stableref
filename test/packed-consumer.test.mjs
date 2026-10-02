import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const tsc = require.resolve("typescript/bin/tsc");

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, { cwd, encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    throw new Error(`${command} failed:\n${error.stdout ?? ""}${error.stderr ?? ""}`, { cause: error });
  }
}

// Install only locked local dependencies, without resolving optional peers from npm.
function installDependency(name, modules) {
  const manifest = require.resolve(`${name}/package.json`, {
    paths: [dirname(require.resolve("@types/react/package.json")), root],
  });
  cpSync(dirname(realpathSync(manifest)), join(modules, name), { recursive: true });
}

test("packed declarations work for isolated public-entry consumers", (t) => {
  const temp = mkdtempSync(join(tmpdir(), "stableref-consumer-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  // Suppress lifecycle scripts: the test command already built the package.
  const packed = JSON.parse(run("npm", ["pack", "--ignore-scripts", "--offline", "--cache", join(temp, "cache"), "--json", "--pack-destination", temp], root));
  assert.equal(packed.length, 1);
  const archive = join(temp, packed[0].filename);

  for (const framework of ["root", "react", "preact"]) {
    const consumer = join(temp, framework);
    const modules = join(consumer, "node_modules");
    const installed = join(modules, "stableref");
    mkdirSync(installed, { recursive: true });
    // Install the actual tarball, not dist or a symlink to the source checkout.
    run("tar", ["-xzf", archive, "--strip-components=1", "-C", installed], consumer);
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));

    if (framework === "root") {
      writeFileSync(join(consumer, "root.ts"), `
import { stable, type Stable, type StableDeps } from "stableref";
const value: Stable<{ id: number }> = stable({ id: 1 });
const deps: StableDeps = [value, 1, null];
// @ts-expect-error Raw references cannot forge proof.
const raw: Stable<{ id: number }> = { id: 1 };
// @ts-expect-error The phantom brand is private.
import { stableBrand } from "stableref";
// @ts-expect-error Internal modules are not package exports.
import * as internal from "stableref/internal";
// @ts-expect-error Root consumers do not acquire framework dependencies.
import * as React from "react";
// @ts-expect-error Neither optional framework is installed.
import * as Preact from "preact";
`);
    } else {
      const dependencies = framework === "react" ? ["react", "@types/react", "csstype"] : ["preact"];
      for (const dependency of dependencies) installDependency(dependency, modules);
      // Run the existing positive AND negative regressions against the packed API.
      for (const name of [`${framework}-types.ts`, `${framework}-strict-types.ts`]) {
        const source = readFileSync(join(root, "test", name), "utf8")
          .replaceAll('"../src/index.js"', '"stableref"')
          .replaceAll(`"../src/${framework}.js"`, `"stableref/${framework}"`);
        writeFileSync(join(consumer, name), source);
      }
    }

    for (const resolution of ["Bundler", "NodeNext"]) {
      writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: resolution === "Bundler" ? "ESNext" : "NodeNext",
          moduleResolution: resolution,
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          types: [],
          lib: ["ES2022", "DOM"],
          verbatimModuleSyntax: true,
        },
        include: ["*.ts"],
      }));
      run(process.execPath, [tsc, "-p", join(consumer, "tsconfig.json")], consumer);
    }
  }
});
