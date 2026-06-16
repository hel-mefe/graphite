# Emission + runtime

Graphite emits a single JavaScript bundle that contains:

- a map of module factories (functions)
- a tiny runtime module loader (`require` + cache)
- optional dev hooks (HMR websocket client)

## Emitter

- `src/emitter/BundleEmitter.ts`

### Emission strategy

For each module in the graph:

1. **Transpile** TypeScript → CommonJS using `ts.transpileModule`
2. Apply transformers:
   - **tree-shaking transformer** (drops unused exports)
   - **require rewrite transformer**: rewrites `require("./x")` → `require("/abs/path/to/x.ts")`
3. Wrap the output as a module factory:

```js
"<moduleId>": function(require, module, exports) {
  // transpiled module body
}
```

## Runtime loader

The emitted runtime:

- stores `__modules__` and `__cache__`
- implements `__require__(id)`:
  - returns cached exports if present
  - executes factory otherwise

### Environment compatibility

The runtime attaches bootstrap to `globalThis`:

- works in Node (no `window`)
- works in the browser (where `window === globalThis`)

## Why rewrite requires?

After transpilation, the TS compiler emits CommonJS `require()` calls using the original specifiers (e.g. `"./message"`).

Graphite’s internal graph identifies modules by **absolute resolved id**, so the runtime must be able to map `require()` calls to those ids. The simplest method is rewriting the arguments at emit time.

