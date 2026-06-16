# Architecture overview

Graphite is intentionally structured like a compiler pipeline. The goal is separation of concerns: each stage has a single job and produces/consumes explicit data structures.

## High-level pipeline

1. **CLI**
   - Parses args (`build` / `dev`).
   - Prints branded output.
   - Invokes either the compiler (`build`) or the dev server (`dev`).

2. **Compiler orchestration**
   - `src/compiler/Compiler.ts` owns options.
   - `src/compiler/Compilation.ts` runs a single build:
     - builds a module graph
     - runs optimizer(s)
     - emits the bundle

3. **Graph build**
   - `src/compiler/GraphBuilder.ts` recursively visits modules starting from `entry`
   - uses:
     - `ModuleFactory` (read file + parse)
     - `Resolver` (turn specifiers into absolute file paths)
     - `DefaultModuleGraph` (store modules + edges)

4. **Optimizations**
   - `src/optimizer/TreeShaker.ts` computes a conservative “used exports” map.

5. **Emission + runtime**
   - `src/emitter/BundleEmitter.ts`:
     - transpiles each module (TypeScript → CommonJS)
     - rewrites `require("./x")` to `require("/abs/path/to/x.ts")` so the runtime can load by module id
     - writes a single `dist/bundle.js` bundle
   - emitted runtime implements a minimal module system + optional dev hooks (HMR websocket client).

## Why this structure?

- **Modularity**: parser, resolver, optimizer, and emitter evolve independently.
- **Correctness by data-modeling**: the module graph is an explicit internal representation (IR).
- **Incrementality**: dev server can update *parts* of the graph rather than rebuilding from scratch.

