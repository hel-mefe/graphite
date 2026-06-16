import ts from "typescript" ;
import type { Dependency, ExportInfo, ImportName } from "../graph/types" ;
import type { ParseResult } from "./types" ;

export class Parser {
  parse(source: string, filePath: string): ParseResult {
    const sf = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.ES2022,
      /*setParentNodes*/ true,
      this.inferScriptKind(filePath),
    ) ;

    const dependencies: Dependency[] = [] ;
    const exports: ExportInfo[] = [] ;

    const addDep = (dep: Dependency) => {
      dependencies.push(dep) ;
    } ;

    const addExport = (ex: ExportInfo) => {
      exports.push(ex) ;
    } ;

    const visit = (node: ts.Node) => {
      // import ... from "x"
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text ;
        const importedNames = this.extractImportNames(node.importClause) ;
        const dep: Dependency = { specifier, kind: "static" } ;
        if (importedNames) dep.importedNames = importedNames ;
        addDep(dep) ;
      }

      // export * from "x" / export { a as b } from "x"
      if (ts.isExportDeclaration(node)) {
        const from = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : undefined ;

        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const el of node.exportClause.elements) {
            const ex: ExportInfo = {
              name: (el.name ?? el.propertyName)?.text ?? el.name.text,
              kind: "reexport",
            } ;
            if (from) ex.from = from ;
            addExport(ex) ;
          }
        } else {
          // export * from "x" or export * (no from)
          const ex: ExportInfo = {
            name: "*",
            kind: "exportAll",
          } ;
          if (from) ex.from = from ;
          addExport(ex) ;
        }

        if (from) {
          addDep({
            specifier: from,
            kind: "static",
            importedNames: [{ kind: "namespace", local: "*" }],
          }) ;
        }
      }

      // export default ...
      if (ts.isExportAssignment(node) && node.isExportEquals === false) {
        addExport({ name: "default", kind: "default" }) ;
      }

      // exported declarations: export const foo, export function bar, export class Baz, export {x}
      if (
        (ts.isFunctionDeclaration(node) ||
          ts.isClassDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isEnumDeclaration(node) ||
          ts.isTypeAliasDeclaration(node)) &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const name = node.name?.text ;
        if (name) addExport({ name, kind: "named" }) ;
      }

      if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            addExport({ name: decl.name.text, kind: "named" }) ;
          }
        }
      }

      // dynamic import("x")
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        addDep({
          specifier: node.arguments[0].text,
          kind: "dynamic",
        }) ;
      }

      ts.forEachChild(node, visit) ;
    } ;

    visit(sf) ;
    return { dependencies, exports } ;
  }

  private inferScriptKind(filePath: string): ts.ScriptKind {
    const lower = filePath.toLowerCase() ;
    if (lower.endsWith(".tsx")) return ts.ScriptKind.TSX ;
    if (lower.endsWith(".jsx")) return ts.ScriptKind.JSX ;
    if (lower.endsWith(".js")) return ts.ScriptKind.JS ;
    if (lower.endsWith(".mjs")) return ts.ScriptKind.JS ;
    return ts.ScriptKind.TS ;
  }

  private extractImportNames(importClause: ts.ImportClause | undefined): ImportName[] | undefined {
    if (!importClause) return undefined ;
    const names: ImportName[] = [] ;

    if (importClause.name) {
      names.push({ kind: "default", local: importClause.name.text }) ;
    }

    const bindings = importClause.namedBindings ;
    if (!bindings) return names.length ? names : undefined ;

    if (ts.isNamespaceImport(bindings)) {
      names.push({ kind: "namespace", local: bindings.name.text }) ;
    } else if (ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        const imported = (el.propertyName ?? el.name).text ;
        const local = el.name.text ;
        names.push({ kind: "named", imported, local }) ;
      }
    }

    return names.length ? names : undefined ;
  }
}

