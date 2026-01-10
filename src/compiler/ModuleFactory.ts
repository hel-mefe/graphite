import fs from "fs" ;
import path from "path" ;
import { Module, ModuleId, Dependency } from "../graph/types" ;

export class ModuleFactory {
  createModule(filePath: string): Module {
    const absolutePath = path.resolve(filePath);
    const source = fs.readFileSync(absolutePath, "utf-8");
  
    const dependencies = this.extractDependencies(source);

    return {
      id: this.createModuleId(absolutePath),
      filePath: absolutePath,
      dependencies
    };
  }

  private createModuleId(filePath: string): ModuleId {
    // simple, stable identity for now
    return filePath ;
  }

  private extractDependencies(source: string): Dependency[] {
    // Vert naive approach that's not scalable (temporary)
      const regex = /import\s+.*?from\s+["'](.*?)["']/g;
      const dependencies: Dependency[] = [] ;
      let match: RegExpExecArray | null ;

      while ((match = regex.exec(source)) !== null) {
        dependencies.push({
          specifier: match[1],
          kind: "static" 
        }) ;
      }

      return dependencies;
  }    

}
