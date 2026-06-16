import { CompilerOptions } from "./types" ;
import { GraphBuilder } from "./GraphBuilder" ;
import { TreeShaker } from "../optimizer/TreeShaker" ;
import { BundleEmitter } from "../emitter/BundleEmitter" ;
import path from "path" ;

export class Compilation {
  private readonly options: CompilerOptions ;

  constructor(options: CompilerOptions) {
    this.options = options ;
  }

  run(): void { 
    const graph = this.buildModuleGraph() ;
    const used = new TreeShaker().analyze(graph, path.resolve(this.options.entry)) ;
    const outFile = this.options.outputFile ?? "bundle.js" ;
    const outDir = path.resolve(this.options.outputDir) ;

    const emitter = new BundleEmitter() ;
    const written = emitter.emit(graph, {
      outDir,
      outFile,
      usedExports: used,
      dev: this.options.dev ?? false,
    }) ;

    console.log(`[graphite] emitted ${written}`) ;
  }

  private buildModuleGraph() {
    const builder = new GraphBuilder() ;
    const graph = builder.build(this.options.entry) ;
    return graph ;
  }
}
