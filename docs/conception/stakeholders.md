# Stakeholders and RACI

**Contents:** [TL;DR](#tldr) · [Stakeholders](#stakeholders) · [RACI](#raci) · [Decision rights](#decision-rights) · [Who provisions, who deploys](#who-provisions-who-deploys) · [This project's reality](#this-projects-reality)

Day 0 · Conception · 2026-10-04. Previous: [business case](business-case.md). Next: [benchmark](benchmark.md).
Detail: [`cmdb.yml`](../../cmdb.yml) → `conception.stakeholders`.

## TL;DR

| Question | Answer |
|---|---|
| Who pays and decides? | The CFO sponsors; the Head of Accounting owns the outcome |
| Who builds? | Two teams: the **finance data & AI product team** (stream-aligned) builds and deploys the jobs, models and agent; the **data & AI platform team** provisions the cloud, Databricks, identities and the agent runtime |
| Who can say no? | Internal audit and security; the works council must agree to anything that monitors staff; the data protection officer advises |
| RACI | **R**esponsible does the work · **A**ccountable signs off (one per row) · **C**onsulted before · **I**nformed after |
| In this portfolio | One person plays every role, an AI assistant helps; the separation is enforced by identities, not people ([responsibility matrix](../security/responsibility-matrix.md)) |

## Stakeholders

> **TL;DR:** three groups: the business that uses it, the two teams that build it, and the guardians who constrain it.

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
| Build: product team | **Product owner (finance data & AI)** | Value delivered in priority order | Scope creep |
| Build: product team | **Data engineers** | Reliable pipelines, clear contracts with sources | Source changes without notice |
| Build: product team | **ML engineer / data scientist** | Clean features, honest evaluation | Labels that do not exist |
| Build: product team | **AI engineer** | Agents that plan well, cheap tokens, tests on tools | A model that invents figures |
| Build: platform team | **Platform / DevOps engineers** (data & AI platform team) | Everything as code, cheap and secure, one paved road for every domain | Hand-made changes, cost spikes, one-off requests |
| Build | **Enterprise architect** | Fit with the company's landscape | One more silo |
| Supply | **SAP and integration team** (SAP basis, channel integrations) | Stable interfaces | Extra load on SAP |

## RACI

> **TL;DR:** one Accountable per activity; the business owns rules and approvals, the team owns the machinery, the works council agrees to anything that monitors staff.

Roles: **CFO** · **HoA** Head of Accounting (with the GL team) · **FPA** FP&A · **SC** store controlling ·
**PO** product owner · **DE** data engineers · **MLE** ML engineer · **AIE** AI engineer · **Plat** platform team · **EA** enterprise architect ·
**IA** internal audit · **Sec** security · **DPO** data protection officer (advises) · **WC** works council (co-decides) · **SAP** SAP/integration team

| Activity | CFO | HoA | FPA | SC | PO | DE | MLE | AIE | Plat | EA | IA | Sec | DPO | WC | SAP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Business case and priorities | A | C | C | C | R | I | I | I | I | C | C | I | I | I | I |
| Platform choice (benchmark, ADRs) | I | C | I | I | C | C | C | C | R | **A** | I | C | I | I | C |
| Access to SAP and POS data | I | A | I | I | C | R | I | I | C | C | I | C | C | I | R |
| Cloud and Databricks platform (network, identities, cost) | I | I | I | I | C | C | I | I | **A/R** | C | I | C | I | I | I |
| Pipelines Bronze → Silver → Gold | I | C | I | I | A | R | I | I | C | I | I | I | I | I | C |
| Data quality rules and tolerances | I | **A** | C | C | C | R | I | I | I | I | C | I | I | I | I |
| Reconciliation rules (what counts as revenue) | I | **A** | I | I | C | R | I | I | I | I | C | I | I | I | I |
| Fraud models: build and evaluate | I | C | I | C | A | C | R | I | I | I | C | I | C | I | I |
| Using scores on employees (DPIA, works agreement) | **A** | C | I | I | R | I | C | I | I | I | C | C | C | **C (agrees)** | I |
| Store margin alerts: follow-up | I | C | I | **A/R** | I | I | I | I | I | I | I | I | I | I | I |
| Forecast: model vs baseline decision | I | I | **A** | C | C | I | R | I | I | I | I | I | I | I | I |
| Agent: prompts, tools, guardrails | I | C | C | I | A | C | C | R | C | C | C | C | C | I | I |
| Agent output: approve close commentary | I | **A/R** | C | I | I | I | I | I | I | I | I | I | I | I | I |
| Fraud case follow-up (cashiers) | I | I | I | I | I | I | I | I | I | I | **A/R** | I | C | I | I |
| Grants and access reviews | I | C | I | I | C | I | I | I | R | I | C | **A** | I | I | I |
| Production change (deploy) | I | I | I | I | **A** | R | R | R | R | I | I | C | I | I | I |
| Incident: pipeline failure | I | I | I | I | A | R | C | C | R | I | I | I | I | I | C |
| Incident: data breach | A | I | I | I | I | C | C | I | R | I | C | **R** | C | I | I |
| Cost and budget | **A** | I | C | I | R | I | I | I | R | I | I | I | I | I | I |

## Decision rights

> **TL;DR:** who decides, and who can stop it.

| Decision | Who decides | Needed before it applies |
|---|---|---|
| A rule tolerance (e.g. EUR 0.01) | Head of Accounting | Internal audit consulted |
| Using a score on employees | CFO, on the DPIA | DPO advice; a works agreement (in Germany, co-determination on technical monitoring, BetrVG §87(1) no. 6) |
| Shipping a model over the baseline | FP&A, on the backtest | — |
| Publishing agent commentary | Financial controller, per draft | — |
| A new network path or egress | Security | — |
| A new platform component | Enterprise architect | An ADR |

## Who provisions, who deploys

> **TL;DR:** the platform team provisions, the product team deploys its code; normally through a self-service portal, here through pull requests.

| | Normally (mature company) | Here |
|---|---|---|
| Platform team | Runs an **internal developer platform**: a portal (e.g. Backstage) with golden-path templates; a product team clicks "new data product" or "new agent" and gets a repo, a pipeline, identities and the runtime, already compliant | Writes the Terraform itself (infra repo); the product team's needs arrive as pull requests |
| Product team | Deploys its jobs, models and agents (DataOps, MLOps, AgentOps) on that platform, without tickets | Same: the data repo deploys the bundle, the models and the agent through gated workflows |
| Why not built | | One domain and one person: a portal pays off from several product teams; documented as a production gap |

## This project's reality

> **TL;DR:** one person, three machine identities, one AI assistant.

| Simulated role | Played by | How separation still holds |
|---|---|---|
| Every human role | The owner | Pull requests, required checks, review checklist |
| Platform engineer's machine | `terraform-platform` | Only infra CI uses it |
| Deploy step | `finance-data-deployer` | Cannot grant or create clusters ([4.5](../stories/4.5-split-service-principals.md)) |
| Running jobs | `finance-pipeline-runner` | Cannot grant, not admin |
| Reviewer | A fresh AI assistant session | Sees only the story and the diff |
