import fs from "fs" ;
import http from "http" ;
import path from "path" ;
import { WebSocketServer, type WebSocket } from "ws" ;

import { GraphBuilder } from "../compiler/GraphBuilder" ;
import { ModuleFactory } from "../compiler/ModuleFactory" ;
import { Resolver } from "../resolver/Resolver" ;
import { TreeShaker } from "../optimizer/TreeShaker" ;
import { BundleEmitter } from "../emitter/BundleEmitter" ;
import type { CompilerOptions } from "../compiler/types" ;
import { logger } from "../shared/logger" ;

export class DevServer {
  private readonly options: CompilerOptions ;
  private readonly builder = new GraphBuilder() ;
  private readonly factory = new ModuleFactory() ;
  private readonly resolver = new Resolver() ;
  private readonly emitter = new BundleEmitter() ;

  private watchers = new Map<string, fs.FSWatcher>() ;

  constructor(options: CompilerOptions) {
    this.options = { ...options, dev: true } ;
  }

  start(): void {
    const outDir = path.resolve(this.options.outputDir) ;
    const outFile = this.options.outputFile ?? "bundle.js" ;
    const entryAbs = path.resolve(this.options.entry) ;

    const graph = this.builder.build(entryAbs) ;
    const shaker = new TreeShaker() ;

    const emitAll = () => {
      const used = shaker.analyze(graph, entryAbs) ;
      this.emitter.emit(graph, { outDir, outFile, usedExports: used, dev: true }) ;
      this.writeHtml(outDir, outFile) ;
      logger.success(`rebuilt ${path.join(outDir, outFile)}`) ;
      return used ;
    } ;

    let used = emitAll() ;

    // Watch all modules currently in the graph
    const ensureWatch = (filePath: string) => {
      if (this.watchers.has(filePath)) return ;
      try {
        const w = fs.watch(filePath, { persistent: true }, (evt) => {
          if (evt !== "change") return ;
          this.onFileChange(filePath, graph, entryAbs, outDir, outFile, () => {
            used = emitAll() ;
            return used ;
          }) ;
        }) ;
        this.watchers.set(filePath, w) ;
      } catch {
        // ignore files that cannot be watched (e.g. virtual deps)
      }
    } ;

    for (const m of graph.getModules()) ensureWatch(m.filePath) ;

    const server = http.createServer((req, res) => {
      const url = req.url ?? "/" ;
      if (url === "/" || url === "/index.html") {
        const html = path.join(outDir, "index.html") ;
        res.writeHead(200, { "content-type": "text/html" }) ;
        res.end(fs.readFileSync(html)) ;
        return ;
      }

      if (url === `/${outFile}`) {
        const js = path.join(outDir, outFile) ;
        res.writeHead(200, { "content-type": "application/javascript" }) ;
        res.end(fs.readFileSync(js)) ;
        return ;
      }

      res.writeHead(404) ;
      res.end("Not found") ;
    }) ;

    const wss = new WebSocketServer({ noServer: true }) ;
    const sockets = new Set<any>() ;

    wss.on("connection", (ws: WebSocket) => {
      sockets.add(ws) ;
      ws.on("close", () => sockets.delete(ws)) ;
    }) ;

    server.on("upgrade", (req, socket, head) => {
      if ((req.url ?? "") !== "/__hmr") {
        socket.destroy() ;
        return ;
      }
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws as WebSocket, req)) ;
    }) ;

    const broadcastUpdate = (id: string, factory: string) => {
      const msg = JSON.stringify({ type: "update", id, factory }) ;
      for (const ws of sockets) ws.send(msg) ;
    } ;

    // Attach broadcaster for rebuild step
    ;(this as any)._broadcastUpdate = broadcastUpdate ;

    const port = 3000 ;
    server.listen(port, () => {
      logger.success(`dev server on http://localhost:${port}`) ;
    }) ;
  }

  private onFileChange(
    filePath: string,
    graph: ReturnType<GraphBuilder["build"]>,
    entryAbs: string,
    outDir: string,
    outFile: string,
    reemit: () => any,
  ): void {
    try {
      // Recreate module (re-parse) and re-wire its edges.
      const mod = this.factory.createModule(filePath) ;

      const resolvedDeps: string[] = [] ;
      for (const dep of mod.dependencies) {
        const resolved = this.resolver.resolve(dep.specifier, filePath) ;
        dep.resolvedPath = resolved ;
        resolvedDeps.push(resolved) ;
      }

      graph.replaceModule(mod) ;
      graph.setDependencies(mod.id, resolvedDeps) ;

      // Ensure new deps exist in graph (selective graph update)
      for (const depAbs of resolvedDeps) {
        if (!graph.hasModule(depAbs)) {
          const child = this.factory.createModule(depAbs) ;
          graph.addModule(child) ;
          const childDeps: string[] = [] ;
          for (const d of child.dependencies) {
            const r = this.resolver.resolve(d.specifier, depAbs) ;
            d.resolvedPath = r ;
            childDeps.push(r) ;
          }
          graph.setDependencies(child.id, childDeps) ;
        }
      }

      // Incremental rebuild: re-emit bundle, but only push HMR update for the changed module.
      const used = reemit() ;
      const depMap = new Map<string, string>() ;
      for (const dep of mod.dependencies) if (dep.resolvedPath) depMap.set(dep.specifier, dep.resolvedPath) ;
      const factory = this.emitter.emitModuleFactory(mod, used.get(mod.id), depMap) ;
      const broadcast = (this as any)._broadcastUpdate as ((id: string, factory: string) => void) | undefined ;
      broadcast?.(mod.id, factory) ;

      // Make sure we watch any new files
      for (const m of graph.getModules()) {
        if (!this.watchers.has(m.filePath)) {
          try {
            const w = fs.watch(m.filePath, { persistent: true }, (evt) => {
              if (evt !== "change") return ;
              this.onFileChange(m.filePath, graph, entryAbs, outDir, outFile, reemit) ;
            }) ;
            this.watchers.set(m.filePath, w) ;
          } catch {}
        }
      }
    } catch (e) {
      logger.error(`rebuild failed: ${(e as Error).message}`) ;
    }
  }

  private writeHtml(outDir: string, outFile: string): void {
    const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Graphite Dev</title></head>
  <body>
    <script src="/${outFile}"></script>
  </body>
</html>
` ;
    fs.mkdirSync(outDir, { recursive: true }) ;
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8") ;
  }
}

