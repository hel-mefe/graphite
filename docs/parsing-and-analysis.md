# Parsing + static analysis

Graphite performs **AST-driven static analysis** (instead of regex scanning) so the dependency graph matches real ES module semantics.

## Parser

- `src/parser/Parser.ts` uses the TypeScript compiler API to create a `SourceFile`.
- The parser extracts:
  - **Static imports**: `import ... from "x"`
  - **Dynamic imports**: `import("x")`
  - **Exports**:
    - `export const foo = ...`
    - `export function bar() {}`
    - `export default ...`
    - `export { a as b } from "x"`
    - `export * from "x"`

## Output

The parser returns:

- `dependencies: Dependency[]`
  - includes `specifier`, `kind`, and for static imports an optional `importedNames[]`
- `exports: ExportInfo[]`

## Why track importedNames?

This is the key bridge into optimization and dev workflows:

- **tree-shaking**: “which exports of a dependency are actually used?”
- **dependency-aware invalidation**: re-run work only for impacted parts of the graph

## Caveats (current scope)

This is a learning-oriented bundler. The parser currently focuses on import/export forms that are most useful for graph construction and “basic tree-shaking”.
It does not yet implement full ECMAScript module linking semantics (live bindings, re-export propagation across multiple hops, etc.).

