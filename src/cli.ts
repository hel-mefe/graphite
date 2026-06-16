import path from "path" ;
import { Compiler } from "./compiler/Compiler" ;
import { DevServer } from "./dev/DevServer" ;
import { logger } from "./shared/logger" ;
import { printBanner } from "./shared/banner" ;

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
    printBanner(logger) ;
    logger.section("Graphite Dev") ;
    logger.info(`entry: ${path.resolve(entry)}`) ;
    logger.info(`out:   ${path.resolve(outDir)}/${outFile}`) ;
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
    printBanner(logger) ;
    logger.section("Graphite Build") ;
    logger.info(`entry: ${path.resolve(entry)}`) ;
    logger.info(`out:   ${path.resolve(outDir)}/${outFile}`) ;
    const compiler = new Compiler({
      entry,
      outputDir: outDir,
      outputFile: outFile,
      dev: hasFlag("--dev"),
    }) ;
    compiler.run() ;
    return ;
  }

  logger.error(`unknown command '${cmd}' (expected build|dev)`) ;
  process.exit(1) ;
}

main() ;

