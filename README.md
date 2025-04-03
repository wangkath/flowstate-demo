# FULL DEMO INSTRUCTIONS (running everything)

## Setup

First, start the backend server from `flowstate-demo`:

1. `yarn build`

2. `yarn start`

Then `cd` into `flowstate`, and:

1. Start LocalStack (in a separate terminal):

```bash
docker run --rm -it \
  -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e DEBUG=1 \
  localstack/localstack
```

2. Deploy the "without flowstate" function:

```
cargo run --bin deploy_function -- --function-name demo_purchase_function_no_flowstate --aws-endpoint http://localhost:4566 --manifest-path tests/demo_purchase_function_no_flowstate/Cargo.toml
```

3. Deploy the "with flowstate" function:

```
cargo run --bin deploy_function -- --function-name demo_purchase_function --aws-endpoint http://localhost:4566 --manifest-path tests/demo_purchase_function/Cargo.toml
```

4. View the DynamoDB tables:

```
npx dynamodb-admin --dynamo-endpoint http://dynamodb.localhost.localstack.cloud:4566
```

## Demo

1. Make sure to create the tables

2. First, show the example of what happens _without Flowstate_, to demonstrate the problem.

3. Then _refresh the frontend_. This will reset the displayed values.

4. Then stick to the example _with Flowstate_.

TODO: there isn't a good way to switch back to not using Flowstate (as far as I can tell) with the current frontend setup? Maybe we could add a button to refresh displayed values based on what's currently in the tables.

---

# `@napi-rs/package-template`

![https://github.com/napi-rs/package-template/actions](https://github.com/napi-rs/package-template/workflows/CI/badge.svg)

> Template project for writing node packages with napi-rs.

# Usage

1. Click **Use this template**.
2. **Clone** your project.
3. Run `yarn install` to install dependencies.
4. Run `npx napi rename -n [name]` command under the project folder to rename your package.

## Install this test package

```
yarn add @napi-rs/package-template
```

## Support matrix

### Operating Systems

|                  | node14 | node16 | node18 |
| ---------------- | ------ | ------ | ------ |
| Windows x64      | ✓      | ✓      | ✓      |
| Windows x32      | ✓      | ✓      | ✓      |
| Windows arm64    | ✓      | ✓      | ✓      |
| macOS x64        | ✓      | ✓      | ✓      |
| macOS arm64      | ✓      | ✓      | ✓      |
| Linux x64 gnu    | ✓      | ✓      | ✓      |
| Linux x64 musl   | ✓      | ✓      | ✓      |
| Linux arm gnu    | ✓      | ✓      | ✓      |
| Linux arm64 gnu  | ✓      | ✓      | ✓      |
| Linux arm64 musl | ✓      | ✓      | ✓      |
| Android arm64    | ✓      | ✓      | ✓      |
| Android armv7    | ✓      | ✓      | ✓      |
| FreeBSD x64      | ✓      | ✓      | ✓      |

## Ability

### Build

After `yarn build/npm run build` command, you can see `package-template.[darwin|win32|linux].node` file in project root. This is the native addon built from [lib.rs](./src/lib.rs).

### Test

With [ava](https://github.com/avajs/ava), run `yarn test/npm run test` to testing native addon. You can also switch to another testing framework if you want.

### CI

With GitHub Actions, each commit and pull request will be built and tested automatically in [`node@14`, `node@16`, `@node18`] x [`macOS`, `Linux`, `Windows`] matrix. You will never be afraid of the native addon broken in these platforms.

### Release

Release native package is very difficult in old days. Native packages may ask developers who use it to install `build toolchain` like `gcc/llvm`, `node-gyp` or something more.

With `GitHub actions`, we can easily prebuild a `binary` for major platforms. And with `N-API`, we should never be afraid of **ABI Compatible**.

The other problem is how to deliver prebuild `binary` to users. Downloading it in `postinstall` script is a common way that most packages do it right now. The problem with this solution is it introduced many other packages to download binary that has not been used by `runtime codes`. The other problem is some users may not easily download the binary from `GitHub/CDN` if they are behind a private network (But in most cases, they have a private NPM mirror).

In this package, we choose a better way to solve this problem. We release different `npm packages` for different platforms. And add it to `optionalDependencies` before releasing the `Major` package to npm.

`NPM` will choose which native package should download from `registry` automatically. You can see [npm](./npm) dir for details. And you can also run `yarn add @napi-rs/package-template` to see how it works.

## Develop requirements

- Install the latest `Rust`
- Install `Node.js@10+` which fully supported `Node-API`
- Install `yarn@1.x`

## Test in local

- yarn
- yarn build
- yarn test

And you will see:

```bash
$ ava --verbose

  ✔ sync function from native code
  ✔ sleep function from native code (201ms)
  ─

  2 tests passed
✨  Done in 1.12s.
```

## Release package

Ensure you have set your **NPM_TOKEN** in the `GitHub` project setting.

In `Settings -> Secrets`, add **NPM_TOKEN** into it.

When you want to release the package:

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]

git push
```

GitHub actions will do the rest job for you.
