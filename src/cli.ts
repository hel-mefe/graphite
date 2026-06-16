import path from "path" ;
import { Compiler } from "./compiler/Compiler" ;
import { DevServer } from "./dev/DevServer" ;

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name) ;
  if (idx === -1) return undefined ;
  return process.argv[idx + 1] ;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name) ;
}

function main(): void {
  const cmd = process.argv[2] ?? "build" ;
  const entry = getArg("--entry") ?? "examples/basic/index.ts" ;
  const outDir = getArg("--outDir") ?? "dist" ;
  const outFile = getArg("--outFile") ?? "bundle.js" ;

  if (cmd === "dev") {
    const server = new DevServer({
      entry: path.resolve(entry),
      outputDir: path.resolve(outDir),
      outputFile: outFile,
      dev: true,
    }) ;
    server.start() ;
    return ;
  }

  if (cmd === "build") {
    const compiler = new Compiler({
      entry,
      outputDir: outDir,
      outputFile: outFile,
      dev: hasFlag("--dev"),
    }) ;
    compiler.run() ;
    return ;
  }

  console.error(`[graphite] unknown command '${cmd}' (expected build|dev)`) ;
  process.exit(1) ;
}

main() ;

