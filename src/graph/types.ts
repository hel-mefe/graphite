// identifier for the module inside the graph
export type ModuleId = string ;

export type ImportKind = "static" | "dynamic" ;

export type ImportName =
  | { kind: "namespace"; local: string }
  | { kind: "default"; local: string }
  | { kind: "named"; imported: string; local: string } ;

// a dependency is an edge in the graph
export interface Dependency {
  // what was written in the import statement
  specifier: string ;

  // is the import static or dynamic
  kind: ImportKind ;

  resolvedPath?: string ;

  /**
   * For static imports, what symbols were requested from the dependency.
   * Used for dependency-aware invalidation + basic tree-shaking.
   */
  importedNames?: ImportName[] ;
}

export interface ExportInfo {
  name: string ;
  kind:
    | "named"
    | "default"
    | "reexport"
    | "exportAll" ;

  /**
   * If export originates from another module (re-export).
   */
  from?: string ;
}

// A module is nothing but a node in the graph
export interface Module {
  id: ModuleId ;
  filePath: string ;
  source: string ;
  dependencies: Dependency[] ;
  exports: ExportInfo[] ;
}
