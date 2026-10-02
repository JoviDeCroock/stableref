import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const require = createRequire(import.meta.url);
const project = fileURLToPath(new URL("../", import.meta.url));

test("packed package consumer types", async (t) => {
  const consumer = await realpath(await mkdtemp(join(tmpdir(), "stableref-consumer-")));
  t.after(() => rm(consumer, { recursive: true, force: true }));

  async function run(command, args, cwd = consumer) {
    try {
      return await exec(command, args, {
        cwd,
        env: { ...process.env, NODE_PATH: "" },
        timeout: 60_000,
        maxBuffer: 4 * 1024 * 1024,
      });
    } catch (error) {
      assert.fail(`${command} ${args.join(" ")}\n${error.stdout}\n${error.stderr}\n${error.message}`);
    }
  }

  const archive = join(consumer, "stableref.tgz");
  // check already built dist; pack the existing artifacts without lifecycle hooks.
  await run("pnpm", ["--config.ignore-scripts=true", "pack", "--out", archive], project);
  await writeFile(join(consumer, "package.json"), JSON.stringify({
    private: true,
    type: "module",
  }));
  // Only the local artifact is installed; optional peers are deliberately absent.
  await run("npm", [
    "install", "--offline", "--ignore-scripts", "--legacy-peer-deps",
    "--no-package-lock", "--no-audit", "--no-fund",
    "--cache", join(consumer, "cache"), archive,
  ]);

  async function copyDependency(name, resolver = require) {
    const manifest = resolver.resolve(`${name}/package.json`);
    await cp(dirname(manifest), join(consumer, "node_modules", name), {
      recursive: true,
      dereference: true,
    });
    return createRequire(manifest);
  }

  await copyDependency("typescript");
  await cp(new URL("./consumer/", import.meta.url), join(consumer, "fixtures"), {
    recursive: true,
  });

  for (const frameworks of [false, true]) {
    if (frameworks) {
      await copyDependency("react");
      await copyDependency("preact");
      const reactTypes = await copyDependency("@types/react");
      await copyDependency("csstype", reactTypes);
    }

    for (const mode of ["Bundler", "NodeNext"]) {
      await t.test(`${mode}: ${frameworks ? "React and Preact hooks" : "root without framework peers"}`, async () => {
        await writeFile(join(consumer, "tsconfig.json"), JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            module: mode === "Bundler" ? "ESNext" : "NodeNext",
            moduleResolution: mode,
            lib: ["ES2022", "DOM"],
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            types: [],
          },
          files: frameworks
            ? ["fixtures/root.mts", "fixtures/react.mts", "fixtures/preact.mts"]
            : ["fixtures/root.mts"],
        }));
        const { stdout } = await run(process.execPath, [
          "node_modules/typescript/bin/tsc", "--project", "tsconfig.json",
          "--pretty", "false", "--listFiles",
        ]);
        // No source alias, symlink, ancestor node_modules, or external ambient types.
        const files = stdout.trim().split(/\r?\n/);
        for (const file of files) {
          assert.ok((await realpath(file)).startsWith(consumer + sep), file);
        }
        for (const entry of frameworks ? ["index", "react", "preact"] : ["index"]) {
          assert.ok(files.includes(join(consumer, "node_modules/stableref/dist", `${entry}.d.mts`)));
        }
        if (!frameworks) {
          const manifest = JSON.parse(await readFile(join(consumer, "package.json"), "utf8"));
          assert.deepEqual(Object.keys(manifest.dependencies), ["stableref"]);
          assert.ok(files.every((file) => !/node_modules\/(?:@types\/)?(?:react|preact)\//.test(file)));
        }
      });
    }
  }
});
