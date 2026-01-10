import path from "path" ;
import { DefaultModuleGraph } from "../graph/ModuleGraph";
import { ModuleFactory } from "./ModuleFactory";

export class GraphBuilder {
  private readonly graph = new DefaultModuleGraph() ;
  private readonly factory = new ModuleFactory() ;

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
      const resolved = this.resolveDependency(dep.specifier, absolutePath) ;
      this.graph.addDependency(module.id, resolved) ;
      this.visit(resolved) ;
    }
  }
  
  private resolveDependency(
    specifier: string,
    importerPath: string
  ): string {
    const baseDir = path.dirname(importerPath) ;
    return path.resolve(baseDir, specifier + ".ts");
  }
}
