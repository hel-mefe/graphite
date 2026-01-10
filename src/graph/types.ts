// identifier for the module inside the graph
export type ModuleId = string ;

// a dependency is an edge in the graph
export interface Dependency {
  // what was written in the import statement
  specifier: string ;

  // is the import static or dynamic
  kind: "static" | "dynamic" ;

  resolvedPath?: string ;
}

// A module is nothing but a node in the graph
export interface Module {
  id: ModuleId ;
  filePath: string ;
  dependencies: Dependency[] ;
}
