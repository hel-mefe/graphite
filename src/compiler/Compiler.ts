import { CompilerOptions } from './types' ;
import { Compilation } from './Compilation' ;

/**
 * The Compiler is the top-level orchestrator, it owns configuration and is responsible for starting compilations.
 */

export class Compiler {
  private readonly options: CompilerOptions ;

  constructor(options: CompilerOptions) {
    this.options = options ;
  }

  /**
   * Start a compilation.
   * Later this will support watch mode and multiple builds (INSHAALAH!!!)
   * Ila l9ina lw9t n supportiw most of the features we'll do so 
   ****/
  run(): void {
    const compilation = this.createCompilation() ;
    compilation.run() ;
  }

  /**
   * Factory method for creating new compilation
   * (Masna3 l compilations)
  */
 
  private createCompilation(): Compilation {
    return new Compilation(this.options) ;
  }

}
