# Dev server, incremental rebuilds, HMR

Graphite’s dev workflow aims for fast iteration by redoing the minimum work possible after a file change.

## Dev server

- `src/dev/DevServer.ts`

Responsibilities:

- build initial graph from entry
- emit the initial bundle + a simple `index.html`
- serve:
  - `/` → `index.html`
  - `/<bundle>` → emitted bundle (default `bundle.js`)
- host a websocket endpoint:
  - `GET /__hmr` (upgrade) for HMR messages

## Incremental rebuild strategy

On file change:

1. Re-create the module via `ModuleFactory` (re-read + re-parse)
2. Resolve its dependencies via `Resolver`
3. Mutate the graph in place:
   - `graph.replaceModule(mod)`
   - `graph.setDependencies(mod.id, resolvedDeps)`
4. Ensure newly discovered deps exist in the graph (selective graph growth)
5. Re-emit the bundle (current implementation), then send a targeted HMR payload for the changed module

## HMR message format

The server broadcasts:

```json
{ "type": "update", "id": "<moduleId>", "factory": "function(require, module, exports) { ... }" }
```

## Runtime behavior

The emitted runtime:

- connects to `ws(s)://<host>/__hmr` in browser environments
- on update:
  - installs the new factory for that module id
  - if the module was previously loaded, re-requires it
  - supports `hot.accept(cb)` so modules can opt into self-accepting updates

## Current trade-offs

- Graph mutation is in-place (fast and simple), but does not yet remove orphaned modules.
- Full bundle re-emit is still done for simplicity; future work can emit just updated factories (or chunked outputs).

