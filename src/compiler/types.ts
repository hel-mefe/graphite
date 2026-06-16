export interface CompilerOptions {
  /**
   *  Entry file path (root of the module graph)
   */

  entry: string ;

  /**
   * Output directory for emitted assets
   */
  outputDir: string ;

  /**
   * Output bundle filename (relative to outputDir)
   */
  outputFile?: string ;

  /**
   * Enable development features (watch + HMR runtime hooks).
   */
  dev?: boolean ;
}

/**
 * High-level compilation phases
 * These phases will be used for hooks, diagnostics and plugins
 *
 */

export type CompilerPhase = "initialize" | "buildModuleGraph" | "optimize" | "emit" | "done" ;
