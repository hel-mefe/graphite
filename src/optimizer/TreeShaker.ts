import type { DefaultModuleGraph } from "../graph/ModuleGraph" ;
import type { ModuleId } from "../graph/types" ;

export interface UsedExports {
  /**
   * If true, treat all exports as used (namespace import / export * usage).
   */
  all: boolean ;
  names: Set<string> ;
}

export class TreeShaker {
  analyze(graph: DefaultModuleGraph, entryId: ModuleId): Map<ModuleId, UsedExports> {
    const used = new Map<ModuleId, UsedExports>() ;

    const get = (id: ModuleId): UsedExports => {
      const cur = used.get(id) ;
      if (cur) return cur ;
      const next = { all: false, names: new Set<string>() } ;
      used.set(id, next) ;
      return next ;
    } ;

    // Entry module is executed; for now treat its exports as used (dev-friendly).
    get(entryId).all = true ;

    for (const mod of graph.getModules()) {
      for (const dep of mod.dependencies) {
        const target = dep.resolvedPath ;
        if (!target) continue ;

        const record = get(target) ;
        const imported = dep.importedNames ?? [] ;

        for (const name of imported) {
          if (name.kind === "namespace") {
            record.all = true ;
          } else if (name.kind === "default") {
            record.names.add("default") ;
          } else {
            record.names.add(name.imported) ;
          }
        }
      }
    }

    return used ;
  }
}

