# Graphite

<p align="center">
  <img width="900" alt="Graphite" src="https://github.com/user-attachments/assets/b1d9e34b-2164-468d-9754-bdb67f19ada7" />
</p>

<p align="center">
  <strong>A modern JavaScript & TypeScript bundler built from scratch.</strong>
</p>

<p align="center">
  Learn how bundlers work internally by implementing every major subsystem yourself.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## Overview

**Graphite** is a modern JavaScript and TypeScript bundler implemented completely from scratch.

The goal of this project isn't to replace production bundlers like **Webpack**, **Rollup**, **Vite**, **Rspack**, **Parcel**, or **esbuild**. Instead, Graphite is designed as a learning project that explores the architecture behind modern build systems.

Rather than treating bundlers as black boxes, we implement every subsystem ourselves—from parsing JavaScript modules to generating optimized bundles and powering a development server with Hot Module Replacement.

By the end of the project, you'll understand not only **how** a bundler works, but **why** it is designed the way it is.

---

# Why Graphite?

Modern JavaScript tooling hides a tremendous amount of complexity.

Graphite exists to answer questions like:

- What is a bundler, really?
- Why is the module graph the heart of every modern bundler?
- How are `import` and `export` transformed into executable code?
- How does tree shaking actually work?
- Where do code splitting and chunk generation come from?
- What happens during build time versus runtime?
- How does Hot Module Replacement update only the affected modules?

Instead of reading documentation, we'll build every one of these systems ourselves.

---

# Project Goals

Graphite is built around the same fundamental subsystems found in modern JavaScript bundlers:

- **Command Line Interface (CLI)** — Entry point for build and development workflows.
- **Compiler & Compilation** — Owns configuration and orchestrates the compilation pipeline.
- **Parser** — Parses JavaScript and TypeScript using the TypeScript Compiler API.
- **Module Resolution** — Resolves module specifiers to source files.
- **Module Graph** — Represents dependencies between every module in the application.
- **Bundle Emitter** — Generates the final executable bundle.
- **Runtime** — Provides the runtime responsible for loading bundled modules.
- **Tree Shaking** — Performs static analysis to eliminate unused code.
- **Code Splitting** — Splits the dependency graph into optimized chunks.
- **Source Maps** — Maps generated code back to the original source.
- **Development Server** — Serves applications during development and watches for changes.
- **Hot Module Replacement (HMR)** — Updates changed modules without requiring a full page reload.
- **Plugin Architecture** — Enables extending the compiler without modifying its core.

Every subsystem builds upon the previous one, gradually forming a complete bundler.

---

# Design Principles

Graphite is built around a few core engineering principles.

### Architecture Before Features

Before writing implementation code, we design the architecture.

Each subsystem has a clear responsibility and communicates through well-defined interfaces.

---

### Graph-First Thinking

The dependency graph is the heart of the bundler.

Everything else—tree shaking, chunking, incremental compilation, HMR, and optimization—is built on top of it.

---

### Separation of Concerns

Each subsystem has one responsibility.

| Component | Responsibility |
|-----------|----------------|
| Parser | Parse JavaScript & TypeScript |
| Resolver | Resolve module specifiers |
| Graph Builder | Build the dependency graph |
| Tree Shaker | Analyze used exports |
| Bundle Emitter | Generate executable bundles |
| Compiler | Own configuration |
| Compilation | Orchestrate the pipeline |

---

### Explicit Dependencies

Configuration is passed explicitly throughout the pipeline.

No hidden globals.

No singleton state.

No implicit dependencies.

Every class receives exactly what it needs.

---

### Correctness Before Performance

Graphite prioritizes readability, architecture, and correctness over raw build speed.

The objective is understanding—not benchmarking.

---

# Compiler Pipeline

Graphite models bundling as a compiler pipeline.

```text
            CLI
             │
             ▼
        Compiler
             │
             ▼
       Compilation
             │
   ┌─────────┼─────────┐
   ▼         ▼         ▼
 Parser   Resolver  GraphBuilder
                 │
                 ▼
           Module Graph
                 │
                 ▼
           Tree Shaker
                 │
                 ▼
          BundleEmitter
                 │
                 ▼
             bundle.js
```

Each stage receives structured data from the previous stage and transforms it into the next representation.

---

# Project Structure

```text
src/
├── chunk/
├── cli.ts
├── compiler/
├── dev/
├── emitter/
├── graph/
├── loader/
├── optimizer/
├── parser/
├── resolver/
├── runtime/
└── shared/
```

Every directory corresponds to a subsystem of the bundler.

As the project evolves, each directory will be implemented independently before being integrated into the compilation pipeline.

---

# Documentation

Graphite is accompanied by an extensive article series:

> **Zero to Bundler: Let's Build a Modern JavaScript Bundler from Scratch with TypeScript**

The articles progressively build every subsystem from first principles, explaining not only *what* we're implementing, but *why* the architecture looks the way it does.

Additional documentation can be found inside:

```text
docs/
```

---

# Learning Philosophy

Graphite is not about memorizing APIs.

It's about learning to think like a compiler engineer.

Throughout this project we'll build every major subsystem ourselves:

- Parse source code.
- Build dependency graphs.
- Resolve modules.
- Analyze exports.
- Generate runtime code.
- Emit optimized bundles.
- Build a development server.
- Implement Hot Module Replacement.

By the end, you'll understand the complete lifecycle of a modern JavaScript bundler.

---

# Roadmap

- Command Line Interface (CLI)
- Compiler & Compilation architecture
- JavaScript & TypeScript parser
- Module resolution
- Dependency graph construction
- Bundle generation
- Runtime generation
- Tree shaking
- Source maps
- Code splitting
- Development server
- Hot Module Replacement (HMR)
- Plugin architecture


# Contributing

Graphite is primarily an educational project, but suggestions, discussions, and improvements are always welcome.

Feel free to open an issue or submit a pull request if you'd like to contribute.

---

# License

MIT License.
