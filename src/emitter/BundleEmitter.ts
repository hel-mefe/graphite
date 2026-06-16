import fs from "fs" ;
import path from "path" ;
import ts from "typescript" ;
import type { DefaultModuleGraph } from "../graph/ModuleGraph" ;
import type { ModuleId } from "../graph/types" ;
import type { UsedExports } from "../optimizer/TreeShaker" ;

export interface EmitOptions {
  outDir: string ;
  outFile: string ;
  usedExports: Map<ModuleId, UsedExports> ;
  dev?: boolean ;
}

export class BundleEmitter {
  emit(graph: DefaultModuleGraph, options: EmitOptions): string {
    const modules: string[] = [] ;

    for (const mod of graph.getModules()) {
      const used = options.usedExports.get(mod.id) ;
      const depMap = new Map<string, string>() ;
      for (const dep of mod.dependencies) {
        if (dep.resolvedPath) depMap.set(dep.specifier, dep.resolvedPath) ;
      }

      const js = this.transpile(mod.source, mod.filePath, used, depMap) ;
      modules.push(`${JSON.stringify(mod.id)}: function(require, module, exports) {\n${js}\n}`) ;
    }

    const runtime = this.runtimePreamble({ dev: options.dev ?? false }) ;
    const entry = Array.from(graph.getModules())[0]?.id ;

    const bundle = [
      runtime,
      `__graphite_bootstrap__({\n${modules.join(",\n")}\n}, ${JSON.stringify(entry)});`,
      ""
    ].join("\n") ;

    const outPath = path.join(options.outDir, options.outFile) ;
    fs.mkdirSync(options.outDir, { recursive: true }) ;
    fs.writeFileSync(outPath, bundle, "utf-8") ;
    return outPath ;
  }

  emitModuleFactory(
    mod: { source: string; filePath: string },
    used: UsedExports | undefined,
    depMap: Map<string, string>,
  ): string {
    const js = this.transpile(mod.source, mod.filePath, used, depMap) ;
    return `function(require, module, exports) {\n${js}\n}` ;
  }

  private transpile(
    source: string,
    filePath: string,
    used: UsedExports | undefined,
    depMap: Map<string, string>,
  ): string {
    const transformers: ts.CustomTransformers = {
      before: [this.makeTreeShakeTransformer(used)],
      after: [this.makeRequireRewriteTransformer(depMap)]
    } ;

    const res = ts.transpileModule(source, {
      fileName: filePath,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        sourceMap: false,
        inlineSourceMap: false,
        inlineSources: false,
      },
      transformers,
    }) ;

    return res.outputText ;
  }

  private makeRequireRewriteTransformer(depMap: Map<string, string>): ts.TransformerFactory<ts.SourceFile> {
    return (ctx) => {
      const visit: ts.Visitor = (node) => {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "require" &&
          node.arguments.length === 1 &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          const spec = node.arguments[0].text ;
          const resolved = depMap.get(spec) ;
          if (resolved) {
            return ctx.factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [ctx.factory.createStringLiteral(resolved)]
            ) ;
          }
        }

        return ts.visitEachChild(node, visit, ctx) ;
      } ;

      return (sf) => ts.visitEachChild(sf, visit, ctx) ;
    } ;
  }

  private makeTreeShakeTransformer(used: UsedExports | undefined): ts.TransformerFactory<ts.SourceFile> {
    const keepAll = !used || used.all ;
    const usedNames = used?.names ?? new Set<string>() ;

    return (ctx) => {
      const visit: ts.Visitor = (node) => {
        if (keepAll) return ts.visitEachChild(node, visit, ctx) ;

        // Drop explicit export declarations of unused names:
        // - export { a, b }
        // - export { a as b } from "x"
        if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
          const kept = node.exportClause.elements.filter((el) => {
            const name = el.name.text ;
            return usedNames.has(name) ;
          }) ;
          if (kept.length === 0) return undefined ;
          return ctx.factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            ctx.factory.updateNamedExports(node.exportClause, kept),
            node.moduleSpecifier,
            node.attributes
          ) ;
        }

        // For exported declarations with a name, strip `export` if unused.
        if (ts.isFunctionDeclaration(node)) {
          const name = node.name?.text ;
          if (name && !usedNames.has(name) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            const mods = node.modifiers.filter((m) => m.kind !== ts.SyntaxKind.ExportKeyword) ;
            return ctx.factory.updateFunctionDeclaration(
              node,
              mods.length ? mods : undefined,
              node.asteriskToken,
              node.name,
              node.typeParameters,
              node.parameters,
              node.type,
              node.body
            ) ;
          }
        }

        if (ts.isClassDeclaration(node)) {
          const name = node.name?.text ;
          if (name && !usedNames.has(name) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            const mods = node.modifiers.filter((m) => m.kind !== ts.SyntaxKind.ExportKeyword) ;
            return ctx.factory.updateClassDeclaration(
              node,
              mods.length ? mods : undefined,
              node.name,
              node.typeParameters,
              node.heritageClauses,
              node.members
            ) ;
          }
        }

        if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
          const decls = node.declarationList.declarations ;
          const keptDecls = decls.filter((d) => {
            if (!ts.isIdentifier(d.name)) return true ;
            return usedNames.has(d.name.text) ;
          }) ;
          if (keptDecls.length === 0) return undefined ;

          const hasAnyExportedKept = keptDecls.some((d) => ts.isIdentifier(d.name) && usedNames.has(d.name.text)) ;
          const nextMods = hasAnyExportedKept ? node.modifiers : node.modifiers?.filter((m) => m.kind !== ts.SyntaxKind.ExportKeyword) ;
          return ctx.factory.updateVariableStatement(
            node,
            nextMods,
            ctx.factory.updateVariableDeclarationList(node.declarationList, keptDecls),
          ) ;
        }

        return ts.visitEachChild(node, visit, ctx) ;
      } ;

      return (sf) => ts.visitEachChild(sf, visit, ctx) ;
    } ;
  }

  private runtimePreamble(opts: { dev: boolean }): string {
    const dev = opts.dev ;
    return `(function(){
  var __modules__ = {};
  var __cache__ = {};
  var __hmr__ = ${dev ? "{}" : "null"};
  var __global__ = (typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global));

  function __require__(id){
    if (__cache__[id]) return __cache__[id].exports;
    if (!__modules__[id]) throw new Error("Module not found: " + id);
    var module = { exports: {} };
    __cache__[id] = module;
    var hot = ${dev ? "{ accept: function(cb){ (__hmr__.listeners[id] = __hmr__.listeners[id] || []).push(cb); } }" : "undefined"};
    __modules__[id].call(module.exports, __require__, module, module.exports, hot);
    return module.exports;
  }

  ${dev ? `
  __hmr__.listeners = {};
  __hmr__.applyUpdate = function(id, factorySrc){
    // eslint-disable-next-line no-eval
    var factory = eval("(" + factorySrc + ")");
    __modules__[id] = factory;
    if (__hmr__.listeners[id]) {
      __hmr__.listeners[id].forEach(function(cb){ cb(); });
    }
  };
  ` : ""}

  __global__.__graphite_bootstrap__ = function(mods, entry){
    __modules__ = mods;
    ${dev ? `
    try {
      if (typeof WebSocket === "undefined" || typeof window === "undefined") throw new Error("no browser websocket");
      var proto = window.location.protocol === "https:" ? "wss" : "ws";
      var ws = new WebSocket(proto + "://" + window.location.host + "/__hmr");
      ws.onmessage = function(ev){
        var msg = JSON.parse(ev.data);
        if (msg.type === "update") {
          __hmr__.applyUpdate(msg.id, msg.factory);
          if (__cache__[msg.id]) { __cache__[msg.id] = undefined; __require__(msg.id); }
        }
      };
    } catch (e) {
      console.warn("[graphite] HMR disabled", e);
    }
    ` : ""}
    __require__(entry);
  };
})();` ;
  }
}

