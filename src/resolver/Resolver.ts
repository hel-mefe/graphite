import fs from "fs" ;
import path from "path" ;

export interface ResolveOptions {
  /**
   * File extensions to try when resolving extensionless specifiers.
   */
  extensions?: string[] ;
}

export class Resolver {
  private readonly extensions: string[] ;

  constructor(options: ResolveOptions = {}) {
    this.extensions = options.extensions ?? [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"] ;
  }

  resolve(specifier: string, importerPath: string): string {
    if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("..")) {
      const baseDir = path.dirname(importerPath) ;
      const abs = specifier.startsWith("/") ? specifier : path.resolve(baseDir, specifier) ;
      const resolved = this.resolveAsFileOrDirectory(abs) ;
      if (!resolved) {
        throw new Error(`Cannot resolve '${specifier}' from ${importerPath}`) ;
      }
      return resolved ;
    }

    // Bare specifier → use Node resolution to locate it, then normalize.
    // This is good enough for dev-time bundling and mirrors common bundler behavior.
    try {
      const resolved = require.resolve(specifier, { paths: [path.dirname(importerPath)] }) ;
      return path.resolve(resolved) ;
    } catch {
      throw new Error(`Cannot resolve package '${specifier}' from ${importerPath}`) ;
    }
  }

  private resolveAsFileOrDirectory(absPath: string): string | undefined {
    // Exact file
    if (this.isFile(absPath)) return absPath ;

    // Try extensions
    for (const ext of this.extensions) {
      const withExt = absPath + ext ;
      if (this.isFile(withExt)) return withExt ;
    }

    // Directory → try index.*
    if (this.isDirectory(absPath)) {
      for (const ext of this.extensions) {
        const idx = path.join(absPath, "index" + ext) ;
        if (this.isFile(idx)) return idx ;
      }
    }

    return undefined ;
  }

  private isFile(p: string): boolean {
    try {
      return fs.statSync(p).isFile() ;
    } catch {
      return false ;
    }
  }

  private isDirectory(p: string): boolean {
    try {
      return fs.statSync(p).isDirectory() ;
    } catch {
      return false ;
    }
  }
}

