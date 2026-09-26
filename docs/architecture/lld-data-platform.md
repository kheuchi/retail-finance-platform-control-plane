# LLD 3 · Data platform

**Contents:** [TL;DR](#tldr) · [Diagram](#diagram) · [Pipeline](#pipeline) · [Catalog layout](#catalog-layout) · [Access](#access) · [Sources and anomalies](#sources-and-anomalies) · [Deploy](#deploy)

Updated 2026-09-26. Back to [HLD](hld.md). Detail:
[data `cmdb.yml`](https://github.com/kheuchi/retail-finance-data-products/blob/main/cmdb.yml) → `sources`, `anomalies`, `volumes`, `pipeline` ·
[infra `cmdb.yml`](https://github.com/kheuchi/retail-finance-platform-infra/blob/main/cmdb.yml) → `stacks.databricks`.

## TL;DR

| Question | Answer |
|---|---|
| Where does data come from? | A seeded generator: 40 stores, 21 months, 8 sources. FX rates are real ECB data |
| How does it land? | CSV files in a Unity Catalog volume, then Auto Loader into Bronze |
| What is done? | Bronze: 8 Delta tables, 4.2m rows, every count matches the generator |
| What is next? | Silver (typed, checked, reconciled), then Gold (finance tables) |
| Who reads what? | Engineers: everything. Analysts, ML and the agent: Gold only |
| How is it tested? | 8 generator tests in CI; the planted anomalies are the answer key |

## Diagram

![Data platform LLD](lld-data-platform.png)

## Pipeline

> **TL;DR:** one job, two tasks today. Silver and Gold tasks come next.

| Step | Where | What |
|---|---|---|
| 1 · generate | Job task, job cluster | Writes CSV per source to `raw.landing` |
| 2 · ingest | Job task, Auto Loader | New files only, into `bronze.*`; adds source file and load time |
| 3 · Silver (next) | | Real types, dedup, bad rows quarantined, GL vs POS reconciliation |
| 4 · Gold (planned) | | Revenue, margin, refunds, actual vs budget |

## Catalog layout

> **TL;DR:** one catalog, five schemas, stored in our `dbx-uc` bucket and bound to this workspace only.

| Schema | Holds |
|---|---|
| `raw` | Volume `landing`: incoming files, ground truth, Auto Loader checkpoints |
| `bronze` | 8 tables, all text, never edited |
| `silver` | Clean, typed tables (next) |
| `gold` | Finance-ready tables (planned) |
| `ops` | Volume `artifacts`: job wheels |

## Access

> **TL;DR:** grants go to groups, never to named people.

| Principal | Grant |
|---|---|
| `finance-data-engineers` | ALL_PRIVILEGES on `finance` |
| `finance-analysts` | USE_CATALOG + USE_SCHEMA/SELECT on `gold` |
| Service principal | Owns every object; jobs run as it |

## Sources and anomalies

> **TL;DR:** realistic retail books with three frauds hidden inside.

| Source | Rows | | Anomaly | Where |
|---|---|---|---|---|
| pos_sales | 3,940,360 | | A1 no-receipt refunds | Cashier S017-C03, from 2026-08 |
| gl_journal | 204,294 | | A2 discount creep | Store S031, from 2026-06 |
| refunds | 53,297 | | A3 manual revenue journals | August 2026 close |
| fx_rates · products · budget · cashiers · stores | 1,329 · 1,200 · 480 · 235 · 40 | | | |

## Deploy

> **TL;DR:** Databricks Asset Bundle, deployed by GitHub Actions only.

Build wheel → upload to `ops.artifacts` → job on policy `finance-jobs`
(single node m6gd.large, spot). Required checks on main: lint + tests, bundle validate.
