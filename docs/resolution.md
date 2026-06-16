# Resolution

Resolution turns an import **specifier** (what you write in code) into an absolute file path (Graphite’s module id).

## Resolver

- `src/resolver/Resolver.ts`

## Supported resolution

### Relative specifiers

For `./x`, `../y`, `/abs/path` Graphite resolves:

- exact file match
- extension probing (by default):
  - `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.json`
- directory index probing:
  - `./dir/index.ts` (and other extensions)

### Bare specifiers (packages)

For `react`, `lodash`, etc. Graphite uses Node’s `require.resolve(specifier, { paths: [...] })` seeded with the importer directory.

This mirrors typical dev-time behavior and keeps the resolver small and understandable.

## Why absolute ids?

Graphite uses the absolute resolved path as:

- **module id**
- **graph key**
- **runtime require key**

This makes identity stable, avoids ambiguous duplicates, and simplifies caching/invalidation logic.

