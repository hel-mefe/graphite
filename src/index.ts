import { Compiler } from "./compiler/Compiler" ;

const compiler = new Compiler({
  entry: "examples/basic/index.ts",
  outputDir: "dist"
});

compiler.run();
