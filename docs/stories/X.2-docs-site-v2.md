# Story X.2 · Docs site v2 (Astro + Svelte)

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Acceptance criteria](#acceptance-criteria) · [What we built](#what-we-built) · [Tricky parts](#tricky-parts) · [Proof](#proof) · [Switch-over](#switch-over) · [References](#references)

Cross-cutting · 2026-10-31 · 🟡 Built, in preview at `/v2/`; switch-over waits for the owner's review

## TL;DR

| | |
|---|---|
| Question | Can the site keep its look and interaction but become easy to change? |
| Before | Four hand-written HTML pages, the biggest 1,228 lines: CSS, JS and content mixed, rendered with HTML strings |
| After | Astro 7 builds the pages; Svelte 5 components run the interactive parts; content in typed data files; same CSS |
| Safety | Build fails on a wrong type or a broken link in the content (arrow to a missing box, story step on a missing arrow, unknown logo) |
| Scope | Only the visual core of the project (home, landscape, tools, architecture). The Markdown docs stay Markdown on GitHub |
| Cost | None: GitHub Pages and Actions are free for a public repo |

## Context

> **TL;DR:** the look was right; the code behind it was hard to maintain (D-033).

The v1 pages grew one patch at a time. Content (boxes, arrows, story steps, quizzes) sat inside the
page script, the renderer built HTML strings, and one global click handler served every widget. A
bug in one place broke the whole page (the `render1` error during the Simple-mode work), and
mistakes in the content only showed when someone opened the page. The "no tool, no build step"
rule was meant for diagram tools (D2, Structurizr), not the site (AGENTS.md corrected).

## Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Same look and behaviour as v1 on all four pages; old URLs and hash links (`#built-flow`, `#gw`) keep working | ✅ |
| 2 | Content in data files, separate from the components; one component per widget | ✅ |
| 3 | `astro check` (types) and content-link checks run in every build and fail it on an error | ✅ |
| 4 | Built and deployed by GitHub Actions; v1 stays live at the same address during the preview | 🟡 workflow ready; needs Pages source = GitHub Actions |
| 5 | v2 in preview at `/v2/` until the owner approves; then v2 replaces v1 and the v1 HTML is deleted | ⬜ |

## What we built

> **TL;DR:** data, components, styles: each in its own place.

| Part | Where | What |
|---|---|---|
| Content | `site/src/data/` | `architecture/built.ts`, `target.ts`, `simple.ts` (Simple mode), `tools.ts`, `landscape.ts`; shapes in `types.ts` |
| Checks | `site/src/data/validate.ts` | Arrow ends, boundaries, lanes, story boxes and arrows, plain-words texts, logos, scores, one pick per tool category |
| Components | `site/src/components/` | `architecture/` (Explorer, Block, Diagram, Sequence, FlipCards, WhoSwitch, Quiz, Chat, SpotGame, ApproveGame), `tools/Scorecard`, `landscape/Landscape`, `Icon` |
| Pages | `site/src/pages/` | Same paths as v1 (`build.format: file`) |
| Styles | `site/src/styles/` | v1 CSS moved unchanged, one file per page |
| Deploy | `.github/workflows/site.yml` | Builds `site/`, copies `docs/` as is, puts the build under `/v2/`, deploys to Pages |

Run locally (WSL): `cd site && npm ci && npm run dev` (Node ≥ 22.23.4).

## Tricky parts

| Symptom | Cause | Fix | Lesson |
|---|---|---|---|
| First build failed: "n8n has unknown icon" | The logo was never added in v1; the tile was blank on the live site | Added from Simple Icons 16.32.0, in v1 and v2 | The content checks earn their keep on day one |
| 62 type errors in the target architecture | Arrows without a label called `R(a, b)` with two arguments | Label made optional in `R()` | Types on the helpers, not only on the data |
| Local preview not reachable from Windows | WSL preview server bound inside WSL | Served the built files with Python, laid out like Pages (`/` = v1, `/v2/` = v2) | Test the final URL layout, not the dev server |

## Proof

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings (18 files) |
| `astro build` | 4 pages; content checks passed |
| v1 vs v2, architecture: 20 sections × 2 modes | Same counts of boxes, arrows, labels, boundaries, table rows, cards, messages, pickers, cards, quizzes, story players in all 40 views; target HLD screenshot identical |
| Interactions (Chrome) | Chat replay (8 messages), figure check (fake caught, real traced), approve / don't approve, story steps, box tap info, tool filters and table, landscape steps and evaluation view; no console errors |
| Not checked | Phone width and light mode on v2 (same CSS as v1); left to the owner's review |

## Switch-over

> **TL;DR:** one setting now, one small commit later.

| Step | Who | What |
|---|---|---|
| 1 | Owner | Settings → Pages → Source: **GitHub Actions** (once). The current site keeps the same address |
| 2 | Owner | Compare `…/` (v1) and `…/v2/` (v2) |
| 3 | Assistant | On approval: drop `/v2` from `base`, deploy v2 at the root, delete the v1 HTML and `docs/assets/icons.js`, remove the preview label |

## References

D-033 · `cmdb.yml` → `toolchain.site` · [AGENTS.md](../../AGENTS.md) (diagram rules) · [X.1 documentation system](README.md#how-the-docs-work)
