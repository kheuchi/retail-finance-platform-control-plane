# Stakeholders and RACI

**Contents:** [TL;DR](#tldr) · [Stakeholders](#stakeholders) · [RACI](#raci) · [Decision rights](#decision-rights) · [This project's reality](#this-projects-reality)

Day 0 · Conception · 2026-10-04. Previous: [business case](business-case.md). Next: [benchmark](benchmark.md).
Detail: [`cmdb.yml`](../../cmdb.yml) → `conception.stakeholders`.

## TL;DR

| Question | Answer |
|---|---|
| Who pays and decides? | The CFO sponsors; the Head of Accounting owns the outcome |
| Who builds? | A product team: product owner, data engineers, ML engineer, platform engineer |
| Who can say no? | Internal audit, security, the data protection officer and the works council |
| RACI | **R**esponsible does the work · **A**ccountable signs off (one per row) · **C**onsulted before · **I**nformed after |
| In this portfolio | One person plays every role, an AI assistant helps; the separation is enforced by identities, not people ([responsibility matrix](../security/responsibility-matrix.md)) |

## Stakeholders

> **TL;DR:** three groups: the business that uses it, the team that builds it, and the guardians who constrain it.

| Group | Role | Wants | Worries about |
|---|---|---|---|
| Business | **CFO** (sponsor) | A faster, defensible close | Cost, audit findings |
| Business | **Head of Accounting / Financial Controller** (business owner) | Reconciled numbers, commentary they can sign | Losing control to a black box |
| Business | **GL accountants** | Fewer manual reconciliations | Being blamed for model errors |
| Business | **Store controlling** | Early margin warnings | False alarms on their stores |
| Business | **FP&A** | A forecast with a known error | A model that beats nothing |
| Guardian | **Internal audit** | Evidence, lineage, fraud cases | Tampered data, unreviewed changes |
| Guardian | **CISO / security** | No data leaving the network, least privilege | Credentials, AI data leaks |
| Guardian | **Data protection officer** | Lawful processing of employee data | Cashier-level scores (GDPR) |
| Guardian | **Works council** | Fair treatment of staff | Employee monitoring by AI |
| Build | **Product owner (finance data products)** | Value delivered in priority order | Scope creep |
| Build | **Data engineers** | Reliable pipelines, clear contracts with sources | Source changes without notice |
| Build | **ML engineer / data scientist** | Clean features, honest evaluation | Labels that do not exist |
| Build | **Platform / DevOps / MLOps engineer** | Everything as code, cheap and secure | Hand-made changes, cost spikes |
| Build | **Enterprise architect** | Fit with the company's landscape | One more silo |
| Supply | **SAP and integration team** (SAP basis, iPaaS) | Stable interfaces | Extra load on SAP |

## RACI

> **TL;DR:** one Accountable per activity; the business owns rules and approvals, the team owns the machinery.

Roles: **CFO** · **HoA** Head of Accounting · **PO** product owner · **DE** data engineers · **MLE** ML engineer ·
**Plat** platform/DevOps · **IA** internal audit · **Sec** security · **DPO** data protection (with works council) · **SAP** SAP/integration team

| Activity | CFO | HoA | PO | DE | MLE | Plat | IA | Sec | DPO | SAP |
|---|---|---|---|---|---|---|---|---|---|---|
| Business case and priorities | A | C | R | I | I | I | C | I | I | I |
| Access to SAP and POS data | I | A | C | R | I | C | I | C | C | R |
| Cloud and Databricks platform (network, identities, cost) | I | I | C | C | I | **A/R** | I | C | I | I |
| Pipelines Bronze → Silver → Gold | I | C | A | R | I | C | I | I | I | C |
| Data quality rules and tolerances | I | **A** | C | R | I | I | C | I | I | I |
| Reconciliation rules (what counts as revenue) | I | **A** | C | R | I | I | C | I | I | I |
| Fraud models: build and evaluate | I | C | A | C | R | I | C | I | C | I |
| Fraud models: approval for use on employees | C | C | R | I | C | I | C | I | **A** | I |
| Forecast: model vs baseline decision | I | C | **A** | I | R | I | I | I | I | I |
| Agent: prompts, tools, guardrails | I | C | A | C | R | C | C | C | C | I |
| Agent output: approve close commentary | I | **A/R** | I | I | I | I | I | I | I | I |
| Fraud case follow-up | I | I | I | I | I | I | **A/R** | I | C | I |
| Grants and access reviews | I | C | C | I | I | R | C | **A** | I | I |
| Production change (deploy) | I | I | **A** | R | R | R | I | C | I | I |
| Incident: pipeline failure | I | I | A | R | C | R | I | I | I | C |
| Incident: data breach | A | I | I | C | C | R | C | **R** | C | I |
| Cost and budget | **A** | I | R | I | I | R | I | I | I | I |

## Decision rights

> **TL;DR:** who can stop what.

| Decision | Who decides | Can be vetoed by |
|---|---|---|
| A rule tolerance (e.g. EUR 0.01) | Head of Accounting | Internal audit |
| Using a score on employees | Data protection officer, works council | — |
| Shipping a model over the baseline | Product owner, on the backtest | Head of Accounting |
| Publishing agent commentary | Financial controller, per draft | — |
| A new network path or egress | Security | — |

## This project's reality

> **TL;DR:** one person, three machine identities, one AI assistant.

| Simulated role | Played by | How separation still holds |
|---|---|---|
| Every human role | The owner | Pull requests, required checks, review checklist |
| Platform engineer's machine | `terraform-platform` | Only infra CI uses it |
| Deploy step | `finance-data-deployer` | Cannot grant or create clusters ([4.5](../stories/4.5-split-service-principals.md)) |
| Running jobs | `finance-pipeline-runner` | Cannot grant, not admin |
| Reviewer | A fresh AI assistant session | Sees only the story and the diff |
