# Roadmap

**Contents:** [The plan in one line](#the-plan-in-one-line) · [Stages](#stages) · [Use cases](#use-cases) · [Scope rule](#scope-rule)

![Plan and roadmap](roadmap.svg)

## The plan in one line

Raw ERP and POS data → governed lakehouse → finance models → an agent that drafts
cited commentary for the controller to approve.

## Stages

> Detail: [`../../cmdb.yml`](../../cmdb.yml) → `phases`

| # | Stage | Status | Done when |
|---|---|---|---|
| 1 | Foundation | Done | Terraform, CI/CD, audit, alarms, budget in place |
| 2 | Lakehouse | Done | Private workspace + Unity Catalog on our S3 |
| 3 | Ingest | Next | Synthetic GL, sales, refunds, budget, FX land in Bronze |
| 4 | Transform & Quality | Planned | Gold finance tables reconcile to controlled inputs |
| 5 | ML Models | Planned | Anomaly and forecast models tracked in MLflow |
| 6 | Serve & Monitor | Planned | Models score on a schedule, with drift checks |
| 7 | AI Agent | Planned | Cited variance commentary; no action without approval |

## Use cases

> Detail: [`../../cmdb.yml`](../../cmdb.yml) → `program.needs`

1. **Refund & margin leakage:** find unusual refunds and margin erosion by store.
2. **Month-end close:** forecast revenue and cash, explain variance vs budget.

## Scope rule

> Detail: [`../../cmdb.yml`](../../cmdb.yml) → `rules`

The trial ends **2026-10-06**. If time runs short, keep one thin end-to-end slice
working and drop extra datasets or models, never the security, lineage or teardown.
