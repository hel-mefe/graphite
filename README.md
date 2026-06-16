# Graphite

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/b1d9e34b-2164-468d-9754-bdb67f19ada7" />


**Graphite** is a from-scratch implementation of a JavaScript/TypeScript bundler, built to deeply understand how modern bundlers work internally.

This project focuses on **first principles**: compiler-style architecture, dependency graphs, build phases, and runtime generation.  
The goal is not to create a production-ready bundler, but to gain a precise, system-level understanding of how tools like Webpack, Rollup, or esbuild are designed and implemented.

---

## Why Graphite?

Modern JavaScript bundlers often feel like black boxes. Graphite exists to answer questions such as:

- What *is* a bundler, really?
- Why are dependency graphs unavoidable?
- How do modules, chunks, and runtime code relate?
- Where do tree-shaking and code-splitting actually come from?
- How much work happens at build-time vs runtime?

By building a bundler step by step, Graphite makes these concepts explicit.

---

## Design Philosophy

Graphite is built with the following principles:

- **Architecture before features**  
- **TypeScript as a design tool, not just an implementation detail**
- **Clear separation of responsibilities**
- **Graph-first thinking**
- **Correctness and clarity over performance**

Every subsystem exists for a reason and mirrors real-world bundler internals.

---

## High-Level Architecture

A bundler is treated as a compiler pipeline:

---

## Documentation

See [`docs/README.md`](./docs/README.md) for a guided walkthrough of Graphite’s architecture, module graph, parsing/resolution, emission/runtime, tree-shaking, and dev server/HMR.


