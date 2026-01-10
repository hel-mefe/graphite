import { CompilerOptions } from "./types" ;
import { GraphBuilder } from "./GraphBuilder" ;

export class Compilation {
  private readonly options: CompilerOptions ;

  constructor(options: CompilerOptions) {
    this.options = options ;
  }

  run(): void { 
    this.buildModuleGraph() ;
  }

  private buildModuleGraph(): void {
    const builder = new GraphBuilder() ;
    const graph = builder.build(this.options.entry) ;
    
    // Temporary debug output
    for (const module of graph.getModules()) {
      console.log(module.filePath) ;
    }
  }
}
