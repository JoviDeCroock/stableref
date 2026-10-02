# Packed consumer type checks

`pnpm check` builds the package and discovers `test/consumer-types.test.mjs`
alongside the runtime tests. To run only consumer checks after a build:

```sh
node --test test/consumer-types.test.mjs
```

The test packs the existing local build with lifecycle scripts disabled, then
installs that tarball once with
`npm install --offline --ignore-scripts --legacy-peer-deps` in a unique temporary
directory. It never installs the registry version or downloads fixture peers.

The compiler is copied from the locked project installation, without symlinks.
The root consumer runs first with neither framework nor its types installed.
Then the same directory receives copies of the installed React, Preact,
`@types/react`, and its `csstype` dependency for the hook consumers. The package
under test always comes from the tarball, never a source or `dist` path mapping.
Every compiler input's real path must remain inside the temporary directory;
ancestor `node_modules` or repository source resolution fails the test.

Both stages run in Bundler and NodeNext modes with strict checking,
`skipLibCheck: false`, and no implicit ambient type packages. Positive proof
assignments and `@ts-expect-error` rejections exercise the public entry points.
The `.mts` fixtures are excluded from the project's source-only `**/*.ts` check
and compiled only in the isolated consumer. Temporary files are removed afterward.
This checks the current lockfile versions, not a minimum-supported version matrix.
