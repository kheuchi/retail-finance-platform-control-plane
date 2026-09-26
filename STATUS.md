# Status

**Contents:** [In one line](#in-one-line) · [Where we are](#where-we-are) · [Where we go](#where-we-go) · [Deadlines and cost](#deadlines-and-cost) · [Bronze, Silver, Gold](#bronze-silver-gold)

Updated 2026-09-26. Full history: [`cmdb.yml`](cmdb.yml) → `progress`.

## In one line

The secure platform is built and the first data is in. Next we clean it and turn it
into trusted finance numbers.

## Where we are

> Detail: [`cmdb.yml`](cmdb.yml) → `phases`, `progress`

| # | Stage | Status | What it means |
|---|---|---|---|
| 1 | Foundation | ✅ Done | AWS account, budget, CI/CD, audit trail, security alarms |
| 2 | Lakehouse | ✅ Done | Private Databricks workspace, no internet access, Unity Catalog on our S3 |
| 3 | Ingest | ✅ Done | 40 stores, 21 months of synthetic data: 4.2m rows loaded, none lost |
| 4 | Transform & Quality | ⏭ Next | Clean the data, check the books balance, publish trusted tables |
| 5 | ML Models | Planned | Spot refund fraud and margin leakage; forecast revenue |
| 6 | Serve & Monitor | Planned | Run the models on a schedule, watch them drift |
| 7 | AI Agent | Planned | Draft cited variance commentary for a human to approve |

## Where we go

1. **Silver:** give every column its real type, reject bad rows, check that the general
   ledger matches the sales. This should catch the planted fake journals.
2. **Gold:** publish the tables finance actually uses: daily revenue, margin, refunds,
   actual vs budget.
3. **Models, then the agent,** reading Gold only.

## Deadlines and cost

> Detail: [`cmdb.yml`](cmdb.yml) → `risks`

- **2026-10-06:** Databricks trial ends. Tear down that day
  ([runbook](https://github.com/kheuchi/retail-finance-platform-infra/blob/main/docs/runbooks/teardown.md)).
- **Running cost:** about USD 2/day for the private network, plus a few cents per job
  run. Databricks usage comes out of the USD 400 trial credit, with alerts at 100, 200,
  300 and 380.

## Bronze, Silver, Gold

Three layers of the same data, each more trustworthy than the last.

| Layer | Think of it as | In this project |
|---|---|---|
| **Bronze** | The delivery, unopened | Files exactly as the systems sent them. Everything is text. Never edited, so we can always go back |
| **Silver** | Unpacked and checked | Correct types (dates, amounts), duplicates removed, bad rows set aside, the books reconciled |
| **Gold** | Ready for the boss | A few tables finance trusts and reads: revenue, margin, refunds, budget variance |

Why keep all three: if a number in Gold looks wrong, you can trace it back through
Silver to the exact file in Bronze. That trace is what an auditor asks for.
