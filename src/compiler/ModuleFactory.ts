import fs from "fs" ;
import path from "path" ;
import { Module, ModuleId } from "../graph/types" ;
import { Parser } from "../parser/Parser" ;

export class ModuleFactory {
  private readonly parser = new Parser() ;

  createModule(filePath: string): Module {
    const absolutePath = path.resolve(filePath);
    const source = fs.readFileSync(absolutePath, "utf-8");

    const parsed = this.parser.parse(source, absolutePath) ;

    return {
      id: this.createModuleId(absolutePath),
      filePath: absolutePath,
      source,
      dependencies: parsed.dependencies,
      exports: parsed.exports,
    };
  }

  private createModuleId(filePath: string): ModuleId {
    // simple, stable identity for now
    return filePath ;
  }

}
