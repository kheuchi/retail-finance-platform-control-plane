# Retail Finance Data, ML and Agentic AI Platform

**Contents:** [Architecture](#architecture) · [Where we are](#where-we-are) · [Start here](#start-here)

An enterprise-style portfolio project on **AWS + Databricks** for the accounting
department of a large (fictional) retailer: governed finance data, forecasting,
anomaly detection, and an AI agent that drafts cited analysis for a human to approve.

![Plan and roadmap](docs/roadmap.svg)

## Architecture

> Detail: [`cmdb.yml`](cmdb.yml) → `architecture`

[![High-level design](docs/architecture/hld.png)](docs/architecture/hld.md)

Click the diagram for the HLD; it links to the five LLDs (network, identity & CI/CD,
data platform, observability & cost, ML).

## Where we are

> Detail: [`cmdb.yml`](cmdb.yml) → `phases`

- **Done:** secure AWS foundation, CI/CD, audit and alerting, private Databricks
  workspace with Unity Catalog on our own S3.
- **Also done:** synthetic ERP and POS data loaded into Bronze, cleaned into Silver (0 rows lost).
- **Next:** GL vs POS reconciliation, then Gold finance tables.
- **Deadline:** Databricks trial ends 2026-10-06, then teardown.

## Start here

| File | What it is |
|---|---|
| [STATUS.md](STATUS.md) | Status and roadmap: where we are, where we go |
| [AGENTS.md](AGENTS.md) | Rules and way of working, for any AI assistant or new contributor |
| [docs/conception/](docs/conception/business-case.md) | **Day 0**: business case and end-to-end workflow, stakeholders (RACI), platform benchmark, ADRs |
| [docs/architecture/](docs/architecture/hld.md) | HLD + 5 LLDs, with draw.io sources |
| [Databricks primer](docs/architecture/databricks-primer.md) | Every Databricks term used here, in plain words |
| [docs/stories/MEMO.md](docs/stories/MEMO.md) | **One page**: what we built, the tricky parts, the top 10 lessons · deeper: [WALKTHROUGH](docs/stories/WALKTHROUGH.md) |
| [docs/stories/](docs/stories/README.md) | How each piece was built and the tricky parts; planned stories for what is next |
| [docs/security/](docs/security/) | Threat model, controls, who owns what |
| [REPOSITORIES.md](REPOSITORIES.md) | Which repo does what |
| [cmdb.yml](cmdb.yml) | Inventory: decisions, risks, threats, controls, stories index, history |

This repo holds coordination and evidence only. Infrastructure code lives in
[retail-finance-platform-infra](https://github.com/kheuchi/retail-finance-platform-infra).
