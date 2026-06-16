# Tree-shaking (current approach)

Graphite implements a **tree-shaking concept** (learning-oriented): it identifies unused exports and removes their export surface where safe.

## Step 1: Compute “used exports”

- `src/optimizer/TreeShaker.ts`

Graphite walks import sites and records what names are requested from each dependency:

- `import { a } from "./x"` ⇒ mark export `a` as used in `./x`
- `import x from "./x"` ⇒ mark `default` as used
- `import * as ns from "./x"` ⇒ mark “all exports used”

This produces:

- `Map<ModuleId, { all: boolean, names: Set<string> }>`

## Step 2: Remove unused exports during emit

- `src/emitter/BundleEmitter.ts`

A TypeScript transformer:

- drops `export { ... }` lists when none of the names are used
- removes unused exported variable declarations
- strips the `export` modifier from unused `export function` / `export class`

## Important notes

- This is **not** a full Rollup-style tree-shaker.
- Graphite currently does not:
  - model side effects precisely
  - propagate usage through multi-hop re-exports exhaustively
  - eliminate unused statements inside modules (beyond export surface)

Even so, this provides a concrete, working foundation for “graph + static analysis → optimization” and a great place to evolve further.

