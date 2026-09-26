# Story X.1 · Documentation system

**Contents:** [TL;DR](#tldr) · [Context](#context) · [What we built](#what-we-built) · [Tricky parts](#tricky-parts) · [References](#references)

As-built · Cross-cutting · 2026-09-14 → 09-26 · All repos · ✅ Done (living)

## TL;DR

| | |
|---|---|
| Goal | Anyone, including future you, understands the project in minutes |
| Built | Short `.md` docs, `cmdb.yml` inventory per repo, HLD + 4 LLDs in draw.io, stories |
| Rule | Each fact lives in one place: cmdb = *what*, stories = *why and how* |
| Hardest part | Keeping docs short while losing nothing |
| Decision | D-024 |

## Context

> **TL;DR:** by 2026-09-25 the markdown had grown to 1,411 lines; nobody would read it.

## What we built

> **TL;DR:** four layers, each with one job.

| Layer | Answers | Where |
|---|---|---|
| Overview | Where are we, what is it? | [README](../../README.md), [STATUS](../../STATUS.md) |
| Architecture | How is it built? | [HLD](../architecture/hld.md) + LLDs |
| Stories | Why, and what went wrong? | [docs/stories/](README.md) |
| Inventory | Exact facts: IDs, ports, dates, status | `cmdb.yml` in each repo |

Every doc starts with a TL;DR table and a contents line, and points to cmdb keys.

## Tricky parts

> **TL;DR:** moving detail must not delete it, and diagram tooling has quirks.

### 1. Cut without losing
- Decisions, threats and controls were **parsed** from the old tables into `cmdb.yml`, not
  retyped, so none were dropped. Full long versions stay in Git history.

### 2. draw.io export
- Export works only with **absolute Windows paths**, one process at a time; a Git Bash loop
  silently produced nothing. Some AWS icon names render blank. Detail: `cmdb.yml` → `architecture.toolchain`.

### 3. Private vs public
- The control plane is private, so these docs are invisible to portfolio readers unless mirrored.

## References

- cmdb: [`cmdb.yml`](../../cmdb.yml) → `rules`, `decisions` (D-024), `architecture`, `stories`
