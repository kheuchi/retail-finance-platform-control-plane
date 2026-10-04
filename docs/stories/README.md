# Stories

**Contents:** [TL;DR](#tldr) · [How to read a story](#how-to-read-a-story) · [How the docs work](#how-the-docs-work) · [Review checklist](#review-checklist) · [Epic 1 · Foundation](#epic-1--foundation) · [Epic 2 · Lakehouse](#epic-2--lakehouse) · [Epic 3 · Ingest](#epic-3--ingest) · [Epic 4 · Transform & Quality](#epic-4--transform--quality) · [Epic 5 · ML Models](#epic-5--ml-models) · [Epic 6 · Serve & Monitor](#epic-6--serve--monitor) · [Epic 7 · AI Agent](#epic-7--ai-agent)

Updated 2026-10-01. **Short on time? Read the one-page [MEMO](MEMO.md). Need to explain it? Read the [WALKTHROUGH](WALKTHROUGH.md).** Index in [`cmdb.yml`](../../cmdb.yml) → `stories`. Status: [STATUS.md](../../STATUS.md). Architecture: [HLD](../architecture/hld.md).

## TL;DR

| Question | Answer |
|---|---|
| What is a story? | One piece of work: why we did it, what we built, what went wrong, how we proved it |
| As-built vs planned? | Epics 1-3 are **as-built**, written after the work. Epic 4 onward is **planned**, written before, with acceptance criteria |
| Where is the inventory? | [`cmdb.yml`](../../cmdb.yml): IDs, status, dates, one-line reasons. Stories hold the explanations |
| MEMO vs walkthrough? | [MEMO](MEMO.md): one line per story (built, trap, lesson). [WALKTHROUGH](WALKTHROUGH.md): how each layer works, why, and the questions you will get |
| Best stories to learn from | [1.3](1.3-least-privilege-deploy-role.md) (IAM traps), [2.1](2.1-where-databricks-runs.md) (cloud choice), [3.3](3.3-first-job-in-the-private-vpc.md) (network debugging) |

## How to read a story

> **TL;DR:** read the TL;DR table first; open "Tricky parts" if you want to understand the hard bits.

Every story has the same sections: **Context** (why) · **What we built** · **Tricky parts**
(symptom → cause → fix → lesson) · **Proof** · **Review** · **References** (docs, cmdb keys, commits).
Planned stories add **Acceptance criteria** before any code is written.

## How the docs work

> **TL;DR:** each fact lives in one place: `cmdb.yml` says *what*, stories say *why and how* (D-024, D-028).

| Layer | Answers | Where |
|---|---|---|
| Overview | Where are we, what is it? | [README](../../README.md), [STATUS](../../STATUS.md) |
| Assistant rules | How must any AI assistant work here? | [AGENTS.md](../../AGENTS.md) (auto-loaded via `CLAUDE.md`) |
| Architecture | How is it built? | [HLD](../architecture/hld.md) + 5 LLDs, draw.io sources next to the PNGs |
| Stories | Why, and what went wrong? | This folder; [MEMO](MEMO.md) and [WALKTHROUGH](WALKTHROUGH.md) summarise them |
| Inventory | Exact facts: IDs, ports, dates, status | `cmdb.yml` in each repo |

Every doc starts with a contents line and a TL;DR table, has a one-line TL;DR per section, and
points to cmdb keys. How it came about (2026-09-25): the markdown had grown to 1,411 lines nobody
would read. Decisions, threats and controls were **parsed** into `cmdb.yml`, not retyped, so none
were lost; the long versions stay in Git history. draw.io exports need absolute Windows paths,
one at a time (`cmdb.yml` → `architecture.toolchain`).

## Review checklist

> **TL;DR:** the author proves it works; the reviewer tries to prove it doesn't.

Run before a story is marked done, ideally as a separate pass (a fresh assistant session or
a second person) that sees only the story and the diff, not the author's reasoning.

| Lens | Question |
|---|---|
| Evidence | Is every acceptance criterion backed by a number, log or test name? |
| Break it | What bad input, wrong identity or rerun was tried? |
| Security | Any secret, broad permission, new egress path, or grant to a named user? |
| Cost | What does it cost per run and per month; is anything left running? |
| Data | Can a row be lost or duplicated without the job failing? |
| Failure | If it stops halfway, what state is left, and is a rerun safe? |
| Docs | Story, cmdb, STATUS, diagrams current; no fact written twice? |
| Simplicity | What could be deleted without losing anything? |

Findings go into the story (fixed, or accepted with a reason); accepted risks go to `cmdb.yml` → `risks`.

## Epic 1 · Foundation

> **TL;DR:** a safe AWS account that only CI can change, with an audit trail and alarms. ✅ Done 2026-09-14 → 09-21.

| # | Story | One line |
|---|---|---|
| 1.1 | [AWS account baseline](1.1-aws-account-baseline.md) | Stop using root, pick a region, remote state, budget |
| 1.2 | [Passwordless CI/CD](1.2-passwordless-cicd.md) | GitHub reaches AWS with OIDC tokens, no stored keys |
| 1.3 | [Least-privilege deploy role](1.3-least-privilege-deploy-role.md) | Tight permissions, the two-phase apply, break-glass |
| 1.4 | [Audit trail and alarms](1.4-audit-and-alarms.md) | CloudTrail, and an alarm filter that silently never fired |
| 1.5 | [Security review, going public](1.5-security-review-going-public.md) | Threat model, history scrub, public repo, lost tags |

## Epic 2 · Lakehouse

> **TL;DR:** a private Databricks workspace in our own VPC, governed by Unity Catalog. ✅ Done 2026-09-22 → 09-25.

| # | Story | One line |
|---|---|---|
| 2.1 | [Where Databricks runs](2.1-where-databricks-runs.md) | Azure, GCP, serverless, NAT: why we ended on AWS + PrivateLink |
| 2.2 | [Fully private network](2.2-private-network.md) | VPC with no internet, built gated off, then switched on |
| 2.3 | [Workspace as code](2.3-workspace-as-code.md) | Service principal, cross-account role, a misleading error |
| 2.4 | [Unity Catalog on our S3](2.4-unity-catalog-on-our-s3.md) | Buckets, the UC role, external IDs, IAM delays |
| 2.5 | [Guardrails](2.5-guardrails.md) | Cluster policies, serverless egress, budget alerts, 3 API surprises |

## Epic 3 · Ingest

> **TL;DR:** realistic accounting data with planted frauds, loaded into Bronze with zero loss. ✅ Done 2026-09-25 → 09-26.

| # | Story | One line |
|---|---|---|
| 3.1 | [Synthetic accounting data](3.1-synthetic-accounting-data.md) | Why synthetic, how the books balance, the 3 anomalies |
| 3.2 | [Catalog and bundle deploy](3.2-catalog-and-bundle-deploy.md) | finance catalog, volumes, grants, Asset Bundle from CI |
| 3.3 | [First job in the private VPC](3.3-first-job-in-the-private-vpc.md) | Four failed runs, then flow logs named the blocked port |

## Epic 4 · Transform & Quality

> **TL;DR:** turn Bronze into trusted finance tables. ✅ Done 2026-09-26 → 09-28.

| # | Story | One line |
|---|---|---|
| 4.1 | [Silver tables](4.1-silver-tables.md) | ✅ How Spark cleans the data; a timeout and an FX bug the quarantine caught |
| 4.2 | [GL vs POS reconciliation](4.2-gl-pos-reconciliation.md) | ✅ 4/4 fake journals found, 0 false alarms; the independent review changed the design |
| 4.3 | [Gold finance tables](4.3-gold-finance-tables.md) | ✅ Revenue, margin, refunds, budget; both remaining frauds surface unprompted |
| 4.4 | [Quality and lineage evidence](4.4-quality-and-lineage.md) | ✅ Two quality gates, certified Gold, one number traced to its file (lineage gap R-11) |
| 4.5 | [Split the service principal](4.5-split-service-principals.md) | ✅ Deployer and runner; the runner cannot audit access, so the platform does |

## Epic 5 · ML Models

> **TL;DR:** find the frauds without being told, forecast the month-end. ✅ Done 2026-09-29.

| # | Story | One line |
|---|---|---|
| 5.1 | [Fraud detection](5.1-fraud-detection.md) | ✅ Both planted frauds ranked #1 without labels |
| 5.2 | [Revenue forecast](5.2-revenue-forecast.md) | ✅ Fair backtest: the baseline beats the model and ships |

## Epic 6 · Serve & Monitor

> **TL;DR:** the chain runs as one scheduled job and says when data or configuration drifts. ✅ Done 2026-10-01 → 10-04.

| # | Story | One line |
|---|---|---|
| 6.1 | [Scheduled pipeline](6.1-scheduled-pipeline.md) | ✅ One scheduled job, failure email, queueing; the first run found a missing permission |
| 6.2 | [Drift checks](6.2-drift-checks.md) | ✅ PSI on model inputs (calendar drift found); nightly `bundle plan` caught a hand edit |

## Epic 7 · AI Agent

> **TL;DR:** a cited first draft of the close commentary, read-only, approved by a person. 🔄 Started 2026-10-04 ([ADR-006](../conception/adr/ADR-006-agent-platform.md)).

| # | Story | One line |
|---|---|---|
| 7.1 | [Month-end close agent](7.1-month-end-agent.md) | 🔄 Own read-only identity, Bedrock (EU) over PrivateLink, figure check, controller approval |
