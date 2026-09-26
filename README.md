# Retail Finance Data, ML and Agentic AI Platform

**Contents:** [Where we are](#where-we-are) · [Start here](#start-here)

An enterprise-style portfolio project on **AWS + Databricks** for the accounting
department of a large (fictional) retailer: governed finance data, forecasting,
anomaly detection, and an AI agent that drafts cited analysis for a human to approve.

![Plan and roadmap](docs/roadmap/roadmap.svg)

## Where we are

> Detail: [`cmdb.yml`](cmdb.yml) → `phases`

- **Done:** secure AWS foundation, CI/CD, audit and alerting, private Databricks
  workspace with Unity Catalog on our own S3.
- **Also done:** synthetic ERP and POS data generated and loaded into Bronze.
- **Next:** Silver and Gold finance tables with reconciliation checks.
- **Deadline:** Databricks trial ends 2026-10-06, then teardown.

## Start here

| File | What it is |
|---|---|
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Goal, rules, current state, next actions |
| [docs/roadmap/roadmap.md](docs/roadmap/roadmap.md) | The plan, stage by stage |
| [docs/security/](docs/security/) | Threat model, controls, who owns what |
| [REPOSITORIES.md](REPOSITORIES.md) | Which repo does what |
| [cmdb.yml](cmdb.yml) | Full detail: decisions, risks, threats, controls, history |

This repo holds coordination and evidence only. Infrastructure code lives in
[retail-finance-platform-infra](https://github.com/kheuchi/retail-finance-platform-infra).
