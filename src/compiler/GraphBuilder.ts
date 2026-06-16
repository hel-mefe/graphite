import path from "path" ;
import { DefaultModuleGraph } from "../graph/ModuleGraph";
import { ModuleFactory } from "./ModuleFactory";
import { Resolver } from "../resolver/Resolver";

export class GraphBuilder {
  private readonly graph = new DefaultModuleGraph() ;
  private readonly factory = new ModuleFactory() ;
  private readonly resolver = new Resolver() ;

  build(entry: string): DefaultModuleGraph {
    this.visit(entry) ;
    return this.graph ;
  }

  private visit(filePath: string): void {
    const absolutePath = path.resolve(filePath) ;

    if (this.graph.hasModule(absolutePath)) {
      return ; // deduplication + cycle safety
    }

    const module = this.factory.createModule(absolutePath) ;
    this.graph.addModule(module) ;

    for (const dep of module.dependencies) {
      const resolved = this.resolver.resolve(dep.specifier, absolutePath) ;
      dep.resolvedPath = resolved ;
      this.graph.addDependency(module.id, resolved) ;
      this.visit(resolved) ;
    }
  }
}
