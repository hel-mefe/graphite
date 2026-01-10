import { DefaultModuleGraph } from "./graph/ModuleGraph" ;
import { Module } from "./graph/types" ;

const graph = new DefaultModuleGraph() ;

const a: Module = {
  id: "A",
  filePath: "/A.ts",
  dependencies: []
} ;

const b: Module = {
  id: "B",
  filePath: "/B.ts",
  dependencies: []
} ;


graph.addModule(a) ;
graph.addModule(b) ;
graph.addDependency("A", "B" ) ;

console.log(graph.getDependencies("A")); // ["B"]
