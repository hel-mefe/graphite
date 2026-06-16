import type { Dependency, ExportInfo } from "../graph/types" ;

export interface ParseResult {
  dependencies: Dependency[] ;
  exports: ExportInfo[] ;
}

