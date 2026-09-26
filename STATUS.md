# Status and roadmap

**Contents:** [TL;DR](#tldr) · [Roadmap](#roadmap) · [Where we are](#where-we-are) · [Where we go](#where-we-go) · [Use cases](#use-cases) · [Deadlines and cost](#deadlines-and-cost) · [Scope rule](#scope-rule) · [Bronze, Silver, Gold](#bronze-silver-gold)

Updated 2026-09-26. Detail: [`cmdb.yml`](cmdb.yml) → `phases`, `progress`. Architecture: [HLD](docs/architecture/hld.md).

## TL;DR

| Question | Answer |
|---|---|
| The plan in one line | Raw ERP and POS data → governed lakehouse → finance models → an agent that drafts cited commentary for the controller to approve |
| Where are we? | Stages 1-3 done: secure platform built, 4.2m rows in Bronze, none lost |
| What is next? | Stage 4: clean the data, reconcile the books, publish trusted tables |
| Deadline | Databricks trial ends 2026-10-06, teardown that day |
| Running cost | ~USD 2/day network + trial credit for Databricks |

## Roadmap

![Plan and roadmap](docs/roadmap.svg)

## Where we are

> **TL;DR:** 3 of 7 stages done. Detail: [`cmdb.yml`](cmdb.yml) → `phases`, `progress`

| # | Stage | Status | Done when |
|---|---|---|---|
| 1 | Foundation | ✅ Done | Terraform, CI/CD, audit trail, security alarms, budget in place |
| 2 | Lakehouse | ✅ Done | Private Databricks workspace, no internet, Unity Catalog on our S3 |
| 3 | Ingest | ✅ Done | 40 stores, 21 months of synthetic data in Bronze: 4.2m rows, zero loss |
| 4 | Transform & Quality | ⏭ Next | Gold finance tables reconcile to controlled inputs |
| 5 | ML Models | Planned | Refund fraud, margin leakage and forecast models tracked in MLflow |
| 6 | Serve & Monitor | Planned | Models score on a schedule, with drift checks |
| 7 | AI Agent | Planned | Cited variance commentary; no action without human approval |

## Where we go

> **TL;DR:** Silver, then Gold, then models and the agent reading Gold only.

1. **Silver:** give every column its real type, reject bad rows, check that the general
   ledger matches the sales. This should catch the planted fake journals.
2. **Gold:** publish the tables finance actually uses: daily revenue, margin, refunds,
   actual vs budget.
3. **Models, then the agent,** reading Gold only.

## Use cases

> **TL;DR:** two jobs the accounting team cares about. Detail: [`cmdb.yml`](cmdb.yml) → `program.needs`

| Use case | What it gives finance |
|---|---|
| Refund & margin leakage | Unusual refunds and margin erosion, by store and cashier |
| Month-end close | Revenue and cash forecast, variance vs budget explained |

## Deadlines and cost

> **TL;DR:** one hard date, small daily cost. Detail: [`cmdb.yml`](cmdb.yml) → `risks`

| Item | Value |
|---|---|
| Databricks trial ends | **2026-10-06**, tear down that day ([runbook](https://github.com/kheuchi/retail-finance-platform-infra/blob/main/docs/runbooks/teardown.md)) |
| Service principal secret expires | ~2026-10-08 |
| Private network | ~USD 2/day |
| Job runs | A few cents each |
| Databricks usage | USD 400 trial credit, alerts at 100, 200, 300, 380 |

## Scope rule

> **TL;DR:** cut features, never controls. Detail: [`cmdb.yml`](cmdb.yml) → `rules`

If time runs short, keep one thin end-to-end slice working and drop extra datasets or
models, never the security, lineage or teardown.

## Bronze, Silver, Gold

> **TL;DR:** three layers of the same data, each more trustworthy than the last.
> The terms come from Databricks and are now common data engineering vocabulary.

| Layer | Think of it as | In this project |
|---|---|---|
| **Bronze** | The delivery, unopened | Files exactly as the systems sent them. Everything is text. Never edited |
| **Silver** | Unpacked and checked | Correct types, duplicates removed, bad rows set aside, the books reconciled |
| **Gold** | Ready for the boss | A few tables finance trusts: revenue, margin, refunds, budget variance |

If a number in Gold looks wrong, you can trace it back through Silver to the exact
file in Bronze. That trace is what an auditor asks for.
