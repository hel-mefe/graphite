# Limitations + roadmap

Graphite is intentionally “from scratch” and learning-oriented. The current implementation prioritizes clarity and correct internal modeling over completeness.

## Current limitations

- **Module format**
  - Emission currently targets CommonJS for the internal runtime.
  - No code-splitting / chunk graph yet (single-bundle output).

- **Tree-shaking**
  - Conservative, export-surface focused.
  - No deep statement-level dead code elimination.
  - Side-effect analysis is not yet modeled (e.g. `import "./polyfill"`).
  - Re-export propagation is not exhaustive across multiple hops.

- **Resolver**
  - Uses Node resolution for bare specifiers (good for dev, not a full bundler-grade resolver).
  - No TS path mappings / `tsconfig` `paths` support yet.

- **Dev server**
  - Re-emits the full bundle for simplicity.
  - Orphan module cleanup is not implemented (removing edges doesn’t currently delete unreachable nodes).

- **Assets**
  - No CSS/image/etc transform pipeline yet.

## Roadmap ideas

- **Chunking + code splitting**
  - Introduce a chunk graph and dynamic import boundaries.

- **Smarter incremental compilation**
  - Persistent caches (module parse/transpile caches keyed by file hash)
  - Emit only updated factories for HMR when possible

- **Better tree-shaking**
  - Side-effect flags per module
  - Re-export propagation
  - Statement-level DCE (control-flow + reference tracking)

- **Plugin interface**
  - A formal plugin API for transforms (TypeScript/JS/CSS/etc).

