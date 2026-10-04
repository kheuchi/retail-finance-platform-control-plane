# Walkthrough: explain the build

**Contents:** [TL;DR](#tldr) · [The 2-minute pitch](#the-2-minute-pitch) · [0 Why](#0--why-the-business-case) · [1 Shape](#1--the-shape) · [2 Foundation](#2--aws-foundation-and-cicd) · [3 Network](#3--private-network) · [4 Workspace and UC](#4--databricks-as-code-and-unity-catalog) · [5 Ingest](#5--data-and-ingest) · [6 Silver](#6--silver-cleaning) · [7 Gold](#7--reconciliation-and-gold) · [8 Quality](#8--quality-gates-and-lineage) · [9 Identities](#9--separation-of-duties) · [10 ML](#10--ml) · [11 Agent](#11--the-ai-agent-planned) · [Production gaps](#what-i-would-change-in-production) · [Numbers](#numbers-to-remember)

Updated 2026-10-01. For a one-page summary see the [MEMO](MEMO.md); for the full story of each step, follow the links.
Decisions: [`cmdb.yml`](../../cmdb.yml) → `decisions` (each D-xxx below is one).

## TL;DR

| Question | Answer |
|---|---|
| What is this doc for? | Understanding how the platform works underneath, well enough to explain and defend it |
| How is each chapter built? | **How it works** (mechanics) · **Why this, not that** (the decision) · **What broke** · **Questions you will get** |
| How long? | ~20 minutes to read; each chapter stands alone |
| MEMO vs walkthrough? | MEMO = cheat sheet before the meeting. Walkthrough = the understanding behind it |

## The 2-minute pitch

> **TL;DR:** say this, then let them pick a chapter.

"I built a finance data platform for the accounting team of a large retailer, on AWS Frankfurt and Databricks,
the way a bank or a big retailer would: everything as code, through pull requests, with no internet access
from the compute. The clusters run in a private VPC with no NAT; they reach Databricks over PrivateLink.
Data lands in Bronze, gets typed and checked in Silver with a quarantine instead of filters, and
becomes four certified Gold tables. A reconciliation of the general ledger against the tills
found all four fake revenue journals I had planted, with zero false alarms. Two unsupervised models found the other
two planted frauds, ranking them first without seeing the answer. The forecast model lost to a simple
baseline, so the baseline ships. Three machine identities split the work: one builds the platform,
one deploys, one runs, and none can do another's job. Every step has a story with what broke and the lesson."

## 0 · Why: the business case

> **TL;DR:** start with the close, not the tools.
> [Business case](../conception/business-case.md) · [stakeholders](../conception/stakeholders.md) · [benchmark](../conception/benchmark.md) · [ADRs](../conception/adr/README.md)

- **Problem:** the month-end close runs on extracts, Excel and samples; frauds surface months late; nobody can trace a number.
- **Flow:** SAP, store POS, planning tool and ECB land as files in S3 → lakehouse certifies → ML scores → agent drafts → controller approves → iPaaS sends to Teams, ServiceNow, CFO pack.
- **Why Databricks:** it scored highest on our criteria (87/100) because one catalog governs tables, files and models with lineage; AWS-native was second (75): everything in our account, but many services to glue.

**Questions you will get**
- *"Why not MuleSoft or Workato for ingestion?"* They move records between applications, priced per task. Millions of receipt lines are bulk files. We use the iPaaS where it fits: sending approved results to Teams and ServiceNow.
- *"Is fraud detection an AI agent?"* No: that is ML (scores). The agent reads the scores and the reconciliation, explains and drafts for a human. Mixing them up is a red flag.
- *"Who signs off?"* The Head of Accounting owns rules and tolerances; the data protection officer and works council approve scoring employees; the controller approves each draft ([RACI](../conception/stakeholders.md#raci)).

## 1 · The shape

> **TL;DR:** two planes, three repos, three identities.

**How it works**

| Piece | What it is |
|---|---|
| Control plane (Databricks') | UI, API, job scheduler, MLflow, Unity Catalog metadata. Runs in Databricks' AWS account |
| Compute plane (ours) | The clusters, in our VPC, reading and writing our S3 buckets. **Finance data never leaves our account** |
| 3 repos | control plane (docs, decisions) · infra (Terraform) · data products (Spark jobs, ML, bundle) |
| 3 identities | `terraform-platform` builds · `finance-data-deployer` deploys · `finance-pipeline-runner` runs jobs |

**Why this, not that**
- Separate repos (D-011): who may change the platform is not who may change a job. Each repo has
  its own pipeline, reviewers and state.
- Classic workspace, not serverless (D-015b): with serverless the compute runs in Databricks' account, so there
  is no network for us to control or evidence.

**Questions you will get**
- *"Where does the data physically live?"* In our S3 bucket `dbx-uc`, in Frankfurt. Databricks only
  holds metadata and sends commands; results that cross are small (query previews, logs).
- *"Why three repos for one person?"* Because the controls are the point: infra changes need a different
  review and identity than a job change. One repo would blur who may change what.

## 2 · AWS foundation and CI/CD

> **TL;DR:** nobody holds a key; CI gets one-hour credentials, and the deploy role can touch only our resources.
> Stories [1.1](1.1-aws-account-baseline.md) · [1.2](1.2-passwordless-cicd.md) · [1.3](1.3-least-privilege-deploy-role.md) · [1.4](1.4-audit-and-alarms.md) · [1.5](1.5-security-review-going-public.md)

**How it works**
- **Terraform state** is Terraform's record of what exists. It lives in a versioned, locked S3 bucket so
  two runs cannot corrupt it. `plan` = compare code with state and reality; `apply` = make the changes.
- **OIDC:** at each run GitHub signs a short token ("I am repo X, branch main"). AWS checks the signature and
  the claims in the role's trust policy, then issues credentials valid ~1 hour. Nothing long-lived to steal.
- **Two roles:** `github-plan` (any run on main, read-only) and `github-deploy` (only the protected
  environment, after a human types `apply`; it applies the exact saved plan).
- **Least privilege:** each IAM statement names its resources; EC2 actions require the project tag.
- **Audit:** CloudTrail (all regions) → audit bucket (365 days) + CloudWatch → metric filters → alarm → email
  on root use or a human admin write.

**Why this, not that**

| Decision | Options | Chosen | Consequence |
|---|---|---|---|
| CI credentials | Stored access key · OIDC | OIDC | No secret in GitHub; trust pinned to repo and branch IDs |
| Landing zone (D-009) | Control Tower multi-account · single account | Single account | Keeps the free credits; multi-account documented as the target |
| Deploy role | Admin · least privilege | Least privilege | Most failures came from here, and each one taught a rule |

**What broke**
- A role cannot grant itself the permission it lacks → **two-phase apply**: grant in one apply, use in the next.
- The alarm filter `$.readOnly = false` was valid and never matched (boolean, not string) → a detection is done only when seen firing.
- Rewriting Git history orphaned 10 release tags that existed only on the remote.

**Questions you will get**
- *"How does GitHub authenticate to AWS?"* OIDC federation: signed token → trust policy checks repo and branch → STS
  issues short credentials. The trust uses GitHub's numeric repo IDs, so a renamed or recreated repo cannot inherit it.
- *"What is a two-phase apply?"* IAM is eventually consistent; if one apply grants and uses a permission,
  the use can run before the grant is visible. Apply 1 changes the role, apply 2 uses it. The IAM simulator checks first.

## 3 · Private network

> **TL;DR:** the VPC has no internet gateway and no NAT; clusters reach Databricks through PrivateLink and S3 through a gateway endpoint.
> Stories [2.1](2.1-where-databricks-runs.md) · [2.2](2.2-private-network.md) · [3.3](3.3-first-job-in-the-private-vpc.md) · [LLD 1](../architecture/lld-network.md)

**How it works**
- **SCC (secure cluster connectivity):** clusters have no public IP; they open an outbound connection to
  the Databricks relay. Nothing connects in.
- **The road home:** normally a NAT gateway (a route to the whole internet). Here an **interface endpoint**
  (PrivateLink): a private IP in our subnet that leads only to the Databricks service. Ports: 443 (API),
  6666 (relay), 8443-8451 (internal services).
- **Other endpoints:** S3 gateway (free; data), STS (credentials), Kinesis (cluster logs and usage).
- **Security groups** on both sides: the workspace SG allows out, the endpoint SG must allow in.
- **Flow logs** record every accepted and rejected connection to the audit bucket.

**Why this, not that**

| Decision | Options | Chosen | Consequence |
|---|---|---|---|
| Egress (D-019, D-021) | NAT (~USD 38/mo) · PrivateLink (~USD 64/mo) | PrivateLink | "No public egress" is literally true; needs the Enterprise tier |
| Cloud (D-020) | Azure · GCP · AWS | AWS | Azure's trial forced a NAT; GCP classic used deprecated GKE |
| Rollout | Build and enable · build behind a flag | Flag (`count = 0`) | Reviewed and merged at zero cost, then switched on |

**What broke**
- The first job failed with "connection reset". Flow logs showed >1,000 REJECTs on 8443-8449: the endpoint SG
  allowed only 443 and 6666. One rule fixed it. **Read the flow logs, don't guess.**
- Checkov was clean for two days because resources behind `count = 0` are not in the plan.

**Questions you will get**
- *"Is a NAT insecure?"* Not by itself: traffic is TLS. But it is a road to the whole internet that a compromised
  library could use to exfiltrate. For finance data before publication, no road is the stronger control.
- *"How did you debug the network?"* Each failure removed one layer (policy, file path, then network); flow logs named the dropped port and which side dropped it.

## 4 · Databricks as code and Unity Catalog

> **TL;DR:** Terraform tells Databricks where our VPC, role and buckets are; Unity Catalog decides who reads what.
> Stories [2.3](2.3-workspace-as-code.md) · [2.4](2.4-unity-catalog-on-our-s3.md) · [2.5](2.5-guardrails.md) · [Databricks primer](../architecture/databricks-primer.md)

**How it works**
- The workspace is a set of **registrations**: a cross-account IAM role (so Databricks can launch EC2 in our
  account), the root bucket, our VPC/subnets/SG, our two PrivateLink endpoints, then the workspace itself.
- **Unity Catalog (UC):** one permission system for every table, volume and model: catalog → schema → table.
  It reaches `dbx-uc` only by assuming our UC role.
- **External ID (confused-deputy defence):** the role trusts Databricks' account *only* with an ID issued for
  our credential, so another Databricks customer cannot point their workspace at our bucket.
- **Guardrails:** cluster policies (small instances, spot, max 2 workers), serverless egress limited to our
  bucket, budget alerts at USD 100/200/300/380.

**Why this, not that**
- Separate Terraform stack for Databricks (D-022): different credentials and lifecycle; it reads AWS outputs, never the reverse.
- Catalog isolated to one workspace: another workspace on the same metastore cannot see it.

**What broke**
- "Unable to load OAuth config" was really a missing `account_id` field: when one resource fails auth and
  the others succeed, suspect the resource.
- UC's external ID only exists after the credential is created → create the credential first, naming a
  role that does not exist yet.

**Questions you will get**
- *"What is Unity Catalog for?"* Grants, lineage and audit in one place, so access is decided centrally, not per cluster.
- *"What stops someone running a huge cluster?"* Cluster policies and no cluster-create right for users; admins bypass policies, so budget alerts back them up (alerts are not brakes).

## 5 · Data and ingest

> **TL;DR:** synthetic books with known frauds; the bundle ships the code; Auto Loader loads Bronze as text.
> Stories [3.1](3.1-synthetic-accounting-data.md) · [3.2](3.2-catalog-and-bundle-deploy.md) · [3.3](3.3-first-job-in-the-private-vpc.md)

**How it works**
- **Generator:** 40 stores, 21 months, 8 sources (sales, ledger, refunds, budget, FX…), seeded so it is
  reproducible. The ledger is built *from* the sales, so it reconciles to the cent; only planted frauds break it.
- **3 planted anomalies:** A1 a cashier's no-receipt refunds, A2 a store's creeping discounts, A3 four fake revenue journals.
- **Wheel / job / bundle:** the wheel is our code packaged; the job says what runs, on which cluster, as whom;
  the bundle ships both. CI runs `databricks bundle deploy` (push model, not GitOps pull).
- **Bronze:** Auto Loader reads the CSVs from the landing volume into Delta tables, every value as text,
  plus the source file name. Nothing can fail to load, so nothing is lost at the door.

**Why this, not that**
- Synthetic data (D-025): no public dataset has a ledger, budget and cashier refunds, and real data brings
  personal data. Planted anomalies give a ground truth to score against.
- Push deploy: simple and auditable; the gap (nothing reverts a manual change) is the drift check of stage 6.

**What broke**
- Code deployed to `/Workspace/Shared` would run with the job identity's power but be editable by anyone → deploy to the identity's own folder.

**Questions you will get**
- *"Why is the dataset small?"* About 1/1,000 of a real chain: fits the budget and one node, yet big enough
  that bad Spark code showed (it did). It scales by adding workers; the code does not change.
- *"Terraform vs the bundle?"* Terraform builds the platform (network, workspace, catalog, grants); the bundle ships the workloads.

## 6 · Silver: cleaning

> **TL;DR:** one spec per source; a generic function types, checks, deduplicates, and sends bad rows to quarantine with a reason.
> Story [4.1](4.1-silver-tables.md) · [LLD 3](../architecture/lld-data-platform.md)

**How it works**
- `try_cast` turns a bad value into null instead of crashing; each failed rule adds a reason to a list per row.
- Empty list → Silver table. Otherwise → `silver.quarantine` with the raw record. **Never filter silently.**
- Dedup with `row_number()` over the business key, latest load first.
- Check: Bronze rows = clean + quarantined, per source, or the job fails (catches rows lost or multiplied by a bad join).
- **Spark is lazy:** the steps build a plan; work happens at the write. Every `count()` re-runs the plan.

**What broke**
- Run 1 timed out: rows cached 3× too fat, the sort ran three times, four full counts → slim rows, one sort, count the written table.
- Run 2 quarantined 123 clean sales: my FX table started on 2 January (first ECB rate). The quarantine caught **my** bug; a filter would have hidden it.

**Questions you will get**
- *"Why quarantine instead of dropping bad rows?"* Because a drop is invisible. The quarantine plus the count check means every row is accounted for, including ones my own bug rejected.
- *"Full rebuild or incremental?"* Full rebuild each run: simple and idempotent at this size. At scale I would use incremental MERGE (see production gaps).

## 7 · Reconciliation and Gold

> **TL;DR:** ledger revenue vs till sales per store and day, matched to the cent; then four Gold tables, written only if they add up to Silver.
> Stories [4.2](4.2-gl-pos-reconciliation.md) · [4.3](4.3-gold-finance-tables.md)

**How it works**
- **GL** (general ledger, the books) vs **POS** (point of sale, the tills). Each day's sales are booked as one
  journal, so both should match. A hand-typed revenue journal with no sales behind it is a classic fake.
- Convert POS lines to EUR unrounded, round once per day (as the journal is booked) → 21,218 of 21,218 clean store-days at EUR 0.00, so the tolerance can be 1 cent.
- **Attribution by amount, never by label:** the journal equal to the day's POS total explains it; the others are flagged. A fake that calls itself "POS" is still caught.
- Gold: `daily_revenue`, `margin`, `refunds`, `budget_variance` (budget pro-rated for the month in progress).

**What broke**
- The independent review found the first version would write a false fraud list on empty input (high), and could blame the genuine journal on a messy day. Fixed before merge.
- The access check would have blocked every run: UC shows inherited grants on each schema. Judge each grant where it was made.

**Questions you will get**
- *"How do you avoid false positives?"* Reconcile the way the books were built, so clean days match exactly; then any difference is real. Days that cannot be attributed are reported once, not blamed on a journal.
- *"What did Gold show?"* S031's margin −8.3 points (next store −2.3); cashier S017-C03 EUR 14.5k of no-receipt refunds (next EUR 196). Found from the data alone.

## 8 · Quality gates and lineage

> **TL;DR:** check Silver, build Gold, check Gold, certify the run; downstream reads only certified Gold.
> Story [4.4](4.4-quality-and-lineage.md)

**How it works**
- Job order: `quality_silver` → `reconcile_gl_pos` → `finance_tables` → `quality_gold`.
- **Critical** checks fail the job (unbalanced journal, absurd amounts, money rows in quarantine, Gold ≠ Silver);
  **warnings** are recorded (missing store-day, volume collapse, refund above sale).
- **Delta versions:** every Delta write creates a new table version. The first gate records Silver's versions; the
  last gate checks they did not change, so Gold is certified on the exact data it used.
- `ops.gold_certification`: one row per run, certified yes/no. ML refuses to run without it.
- **Lineage:** UC's lineage API (table → table) plus a row trace: one Gold number → 144 Silver rows → 144 Bronze rows → one CSV file.

**What broke**
- A new check fired on clean data: a Swiss refund converted at a later rate exceeded its sale by cents in EUR.
  Compare money in the currency it was paid in.

**Questions you will get**
- *"How do you know Gold is right?"* It must add up to Silver (EUR 67.1m both sides), Silver must not have changed during the build, and every critical check must pass; then the run is certified.
- *"How would an auditor trace a number?"* Lineage API for tables, row trace down to the source file.

## 9 · Separation of duties

> **TL;DR:** one identity could do everything; now three, each tested on what it must not do.
> Story [4.5](4.5-split-service-principals.md) · [LLD 2](../architecture/lld-identity-cicd.md)

**How it works**

| Identity | Can | Proven it cannot |
|---|---|---|
| `terraform-platform` | Account admin, infra CI only | Not used by the data repo |
| `finance-data-deployer` | Deploy the bundle, launch jobs as the runner | Grant, create clusters |
| `finance-pipeline-runner` | Read/write the finance schemas | Be admin, grant (checked on every Gold run) |

- An access audit (allow-list: analysts read Gold only) runs in infra CI as `terraform-platform`: 39 securables, 0 violations.

**What broke**
- Gold refused to publish as the runner: the runner cannot see other principals' grants. **The worker cannot be the auditor**, so the check moved to the identity entitled to run it.
- A negative test was refused for the wrong reason (bad request, not permission). A negative test must fail for the reason you test.

**Questions you will get**
- *"Why does it matter?"* A bug or compromise in data code ran with account-admin power. Now it can only touch finance tables.

## 10 · ML

> **TL;DR:** two unsupervised fraud detectors and a forecast that had to beat a baseline; all on certified Gold, inside our VPC.
> Stories [5.1](5.1-fraud-detection.md) · [5.2](5.2-revenue-forecast.md) · [LLD 5](../architecture/lld-ml.md)

**How it works**
- **Isolation Forest:** builds random trees that split the data at random values. An unusual point gets
  isolated in few splits (short path) → high anomaly score. No labels needed. `contamination` = share to flag.
- **Features are relative:** a cashier vs the other cashiers of the same store; a store vs its own months 4-12 back,
  net of chain-wide moves. A big store is not suspicious for being big.
- **Forecast:** gradient boosting on month, horizon, store level, lags (1, 2, 12) vs a **seasonal-naive baseline**
  (same month last year × recent growth). Backtest on the last 3 complete months; **MAPE** (mean absolute
  percentage error) decides. The winner ships.
- **MLflow** records parameters, metrics and models; models are registered in UC `finance.ml`. Runs on our job cluster, no internet.

**Why this, not that**
- Unsupervised: in real life fraud labels are rare and late; the answer key is used only to score, never to train (a test checks it).
- Baseline as the bar: the comparison is the deliverable, not the fancy model.

**What broke**
- A 6-month rolling baseline slowly absorbed the creeping discount fraud → compare with a past that skips recent months.
- The first backtest gave the model 3 training pairs: "baseline wins" was decided before the race. Fixed (200 rows per horizon); the baseline still wins, now fairly.

**Questions you will get**
- *"Your model lost. Isn't that a failure?"* No: shipping a model that is worse than last year's number would be. 21 months of history is too little for it to learn more than seasonality and trend.
- *"How do you know the detectors work?"* Both planted frauds ranked #1 in each month they were active, with 0-3 false alarms per month.
- *"Any ethical issue?"* Employee-level fraud scores are readable by analysts (R-12, accepted for synthetic data). In production: internal audit only, works council involved.

## 11 · The AI agent (planned)

> **TL;DR:** a job in our VPC that drafts month-end commentary from certified Gold, calls Bedrock over a private endpoint, and a controller approves.

**Why this, not that**
- Model in Frankfurt via a PrivateLink endpoint: no internet path, data stays in the EU. Read-only on finance data; a human approves anything that would be posted.
- Not Databricks Model Serving or Genie as the core: the agent is a scheduled batch job, and Bedrock reached privately keeps the same network story.

**Questions you will get**
- *"How do you stop the agent inventing numbers?"* It may cite only certified Gold figures; the draft is checked against Gold, and a controller signs off.

## What I would change in production

> **TL;DR:** the honest list; interviewers ask for it.

| Today | In production |
|---|---|
| Single AWS account | AWS Organizations + Control Tower: separate accounts for prod, non-prod, logs, security |
| Databricks secret (14 days) in GitHub | OIDC federation to Databricks, no secret |
| Full rebuild each run | Incremental: Auto Loader + MERGE, partitioned or clustered by date |
| Manual job runs | Scheduled, with freshness checks, alerts and a drift check on deployed jobs (stage 6) |
| GitHub 2FA off (R-01) | Mandatory 2FA, SSO |
| Fraud scores readable by analysts (R-12) | Restricted to internal audit |
| No disaster recovery tested | Cross-region backup of state and data; restore drill |

## Numbers to remember

| Fact | Value |
|---|---|
| Data | 4.2m rows, ~482 MB CSV, 21 months, 40 stores |
| 2025 net sales / margin / returns | EUR 38.88m / 34.31% / 1.42% |
| Reconciliation | 21,222 store-days; 4 planted, 4 found, 0 false positives |
| Fraud detectors | S017-C03 #1 Aug-Sep; S031 #1 Jul-Sep |
| Forecast backtest MAPE | Baseline 7.5% vs model 10.3%: baseline ships |
| Network cost | PrivateLink ~USD 64/month vs NAT ~38 |
| Access audit | 39 securables, 0 violations |
