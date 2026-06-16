# Module graph

Graphite models the project as a directed graph:

- **Node**: a `Module` (file)
- **Edge**: a `Dependency` (an import relationship)

The graph is the primary internal representation used across the build lifecycle.

## Data model

- `src/graph/types.ts`
  - `Module`: `{ id, filePath, source, dependencies, exports }`
  - `Dependency`: `{ specifier, kind, resolvedPath?, importedNames? }`
  - `ExportInfo`: `{ name, kind, from? }`

## Graph implementation

- `src/graph/ModuleGraph.ts` implements `DefaultModuleGraph`:
  - `modules: Map<ModuleId, Module>`
  - `edges: Map<ModuleId, Set<ModuleId>>` (dependencies)
  - `reverseEdges: Map<ModuleId, Set<ModuleId>>` (dependents)

### Why store reverse edges?

Reverse edges are essential for development workflows:

- **dependency-aware invalidation**: “which modules are impacted when X changes?”
- **selective rebuild**: update module X, then optionally traverse dependents if needed

## Mutation APIs (for incremental rebuild)

`DefaultModuleGraph` exposes:

- `replaceModule(module)`: update a module node in place
- `setDependencies(from, to[])`: replace edges for a module and keep reverse edges consistent

These allow the dev server to:

- re-parse a changed file
- update its outgoing edges
- keep traversal and invalidation operations correct

