# Quickstart

## Install

From the repo root:

```bash
npm install
```

## Build a bundle (one-off)

```bash
npm run bundle
node dist/bundle.js
```

## Dev mode (watch + HMR endpoint)

```bash
npm run dev
```

Then open `http://localhost:3000`.

## CLI (direct)

```bash
npx ts-node src/cli.ts build --entry examples/basic/index.ts --outDir dist --outFile bundle.js
npx ts-node src/cli.ts dev   --entry examples/basic/index.ts --outDir dist --outFile bundle.js
```

