# Docs map

**Contents:** [TL;DR](#tldr) · [Folders](#folders) · [Reading paths](#reading-paths) · [Where a new doc goes](#where-a-new-doc-goes)

Updated 2026-11-03. Detail: [`cmdb.yml`](../cmdb.yml) → `conception`, `architecture`, `stories`. Rules: [AGENTS.md](../AGENTS.md).

> 🌐 **Prefer pictures?** The [interactive web app](https://kheuchi.github.io/retail-finance-platform-control-plane/) shows the same platform, box by box.

## TL;DR

| Question | Answer |
|---|---|
| 🗂️ How are the docs sorted? | By question: why (conception), what runs (architecture), what we would build (target), how to explain it (guides), how it was built (stories), how it is protected (security) |
| 📌 What is current, what is history? | Everything outside `stories/` describes today. Stories and ADRs keep what was true when they were written |
| 🧹 What was removed on 2026-11-03? | The French copy of the reference architecture and a landscape page that only pointed to the web app. Both are in Git history |

## Folders

> **TL;DR:** six folders, one question each.

| Folder | Answers | Holds |
|---|---|---|
| [conception/](conception/business-case.md) | Why does it exist, and what did we decide on day 0? | Business case and workflow, stakeholders (RACI), benchmark, [ADRs](conception/adr/README.md) |
| [architecture/](architecture/hld.md) | What runs today? | HLD, 6 LLDs (network, identity & CI/CD, data platform, observability & cost, ML, agent), screenshots in `img/` |
| [target/](target/reference-architecture.md) | What would a large grocer build next? (not built) | Reference architecture (margin recovery agent), [evaluation and observability](target/evaluation-observability.md) |
| [guides/](guides/MEMO.md) | How do I explain it? | [MEMO](guides/MEMO.md) (one page), [WALKTHROUGH](guides/WALKTHROUGH.md) (each layer, likely questions), [Databricks primer](guides/databricks-primer.md), [cloud equivalents](guides/cloud-equivalents.md) |
| [stories/](stories/README.md) | How was each piece built, and what went wrong? | One file per story, review checklist, docs system (X.1) |
| [security/](security/threat-model.md) | What could go wrong, and what stops it? | [Threat model](security/threat-model.md), [control matrix](security/control-matrix.md), [responsibility matrix](security/responsibility-matrix.md) |
| `img/` | | Roadmap picture used by [STATUS](../STATUS.md) |

Root files: [README](../README.md) (entry), [STATUS](../STATUS.md) (where we are), [AGENTS](../AGENTS.md) (rules), [REPOSITORIES](../REPOSITORIES.md) (which repo does what), [`cmdb.yml`](../cmdb.yml) (facts).

## Reading paths

> **TL;DR:** pick by how much time you have.

| You have | Read |
|---|---|
| 5 minutes | [README](../README.md), then the [web app](https://kheuchi.github.io/retail-finance-platform-control-plane/) in Simple mode |
| 15 minutes | [MEMO](guides/MEMO.md), [HLD](architecture/hld.md) |
| An interview to prepare | [WALKTHROUGH](guides/WALKTHROUGH.md), [cloud equivalents](guides/cloud-equivalents.md), the [ADRs](conception/adr/README.md) |
| A design review | [Business case](conception/business-case.md), [HLD](architecture/hld.md) and the LLDs, [target](target/reference-architecture.md), [threat model](security/threat-model.md) |

## Where a new doc goes

> **TL;DR:** by the question it answers; never move a story, the HLD or an LLD.

| New doc | Folder |
|---|---|
| A piece of work (why, built, broke, proof) | `stories/`, plus a row in `cmdb.yml` → `stories` |
| A decision with options | `conception/adr/`, plus `cmdb.yml` → `decisions` |
| A design of something that runs | `architecture/` |
| A design of something not built | `target/` |
| An explainer or cheat sheet | `guides/` |

The infra and data repos link to `stories/*.md`, `architecture/hld.md` and `architecture/lld-*.md`: those paths stay fixed.
