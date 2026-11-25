---
status: accepted
date: 2026-11-24
decision-makers: project author
---

# Monorepo with pnpm workspaces and Turborepo

## Context and Problem Statement

watch-and-learn has four apps (Electron desktop, NestJS API, Next.js web,
Expo mobile) that share a lot: the shape of a saved word, the API contract,
spaced-repetition logic, and lint/format/TypeScript settings. If each app
kept its own copy, the copies would drift apart and a change to a shared
type would break apps silently.

How should the code be organized so shared code has one source of truth,
and changes are checked across every app at once?

## Decision Drivers

- One source of truth for shared types and logic
- A change to a shared package is type-checked in every app that uses it
- Fast local and CI builds as the number of apps grows
- Simple enough for one developer to maintain

## Considered Options

- Separate repositories, sharing code through published npm packages
- Monorepo with npm or Yarn workspaces only
- Monorepo with pnpm workspaces + Turborepo
- Monorepo with Nx

## Decision Outcome

Chosen option: **pnpm workspaces + Turborepo**. pnpm links local packages
(`@wal/types`, `@wal/config`) into each app with no publishing step.
Turborepo runs `build`, `lint`, and `typecheck` in dependency order and
caches results, so unchanged packages are skipped.

### Consequences

- Good, because a change to `@wal/types` is type-checked against all apps
  in one CI run.
- Good, because one lockfile and one set of quality gates (ESLint,
  Prettier, Husky, commitlint, CI) cover the whole project.
- Good, because pnpm's strict `node_modules` layout catches imports of
  packages that aren't declared as dependencies.
- Bad, because some tools (notably React Native/Expo and Electron
  packagers) need extra configuration to work with pnpm's symlinked
  `node_modules`.
- Bad, because there is more up-front setup than a single app.

## Pros and Cons of the Options

### Separate repositories

- Good, because each app is fully independent.
- Bad, because every shared change means publish → bump → install in each
  repo, so types drift between apps.

### npm or Yarn workspaces only

- Good, because there is one fewer tool to learn.
- Bad, because there is no task caching or dependency-ordered task running,
  so CI rebuilds everything every time.

### pnpm workspaces + Turborepo

- Good, because it is fast, disk-efficient, and strict about dependencies.
- Good, because Turborepo is a thin layer over existing `package.json`
  scripts and is easy to remove.
- Bad, because pnpm needs workarounds for some tooling (see above).

### Nx

- Good, because it is very capable: code generators, dependency graph,
  plugins.
- Bad, because it is heavier and more opinionated than a one-person
  project needs.
