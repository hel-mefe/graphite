import { Module, ModuleId } from './types' ;

export interface ModuleGraph {
  hasModule(id: ModuleId): boolean ;
  getModule(id: ModuleId): Module | undefined ;

  addModule(module: Module): void ;
  addDependency(from: ModuleId, to: ModuleId): void ;

  getDependencies(id: ModuleId): ModuleId[] ;
  getModules(): Iterable<Module> ;
}

export class DefaultModuleGraph implements ModuleGraph {
  private readonly modules = new Map<ModuleId, Module>() ;
  private readonly edges = new Map<ModuleId, Set<ModuleId>>() ;

  hasModule(id: ModuleId): boolean {
    return this.modules.has(id) ;
  }

  getModule(id: ModuleId): Module | undefined {
    return this.modules.get(id) ;
  }

  addModule(module: Module): void {
    if (this.modules.has(module.id)) {
      return ; // deduplication is critical
    }

    this.modules.set(module.id, module) ;
    this.edges.set(module.id, new Set()) ;
  }

  addDependency(from: ModuleId, to: ModuleId): void {
    const deps = this.edges.get(from) ;
    if (!deps) {
      throw new Error(`Module ${from} does not exist in graph`);
    }

    deps.add(to)
  }

  getDependencies(id: ModuleId): ModuleId[] {
    return Array.from(this.edges.get(id) ?? [])
  }

  getModules(): Iterable<Module> {
    return this.modules.values() ;
  }
}

