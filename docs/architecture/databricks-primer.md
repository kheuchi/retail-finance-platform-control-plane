# Databricks primer

**Contents:** [TL;DR](#tldr) · [Where things run](#where-things-run) · [Compute](#compute) · [Code and automation](#code-and-automation) · [Data and governance](#data-and-governance) · [Analytics, ML and AI](#analytics-ml-and-ai) · [Billing](#billing)

For readers who do not know Databricks. Plain words first, then what it is in this project.
Architecture: [HLD](hld.md). Detail: [`cmdb.yml`](../../cmdb.yml) → `program.databricks`, `architecture`.

## TL;DR

| Question | Answer |
|---|---|
| What is Databricks? | A platform to store, process and analyse large data with Spark, SQL and ML, on top of a cloud (here AWS) |
| Where does our data live? | In our own S3 buckets; Databricks manages access to it but does not hold it |
| Who runs the computers? | Our AWS account (classic clusters) or Databricks' account (serverless) |
| How is access controlled? | Unity Catalog: one permission system for every table, file and model |
| How do we ship code? | Bundles from GitHub Actions; nobody clicks in production |

## Where things run

> **TL;DR:** Databricks is the brain; our AWS account holds the muscles and the memory.

| Term | In plain words | In this project |
|---|---|---|
| **Account** | The top level: billing, users, workspaces | Enterprise tier, bought through AWS Marketplace |
| **Workspace** | One Databricks "site" with its own URL, jobs and notebooks | `retail-finance-platform` |
| **Control plane** | Databricks' own servers: web UI, API, scheduler | In Databricks' AWS account; we reach it privately (PrivateLink) |
| **Compute plane** | The machines that process the data | Classic: EC2 in **our** VPC. Serverless: in Databricks' account |

## Compute

> **TL;DR:** clusters are rented computers; policies stop anyone renting big ones.

| Term | In plain words | In this project |
|---|---|---|
| **Cluster** | A group of machines running Spark (a driver + workers) | Single-node m6gd.large/xlarge, spot |
| **All-purpose cluster** | Stays on for people working interactively | Policy `finance-small`, auto-stops after 10-30 min |
| **Job cluster** | Starts for one job run, then disappears | Policy `finance-jobs`: every pipeline uses one |
| **Serverless** | Databricks runs the machines for you, starts in seconds | Egress restricted to our data bucket; not used for pipelines |
| **Cluster policy** | Rules on what cluster a user may create (size, spot, auto-stop) | `finance-small`, `finance-jobs` |
| **Spark** | The engine that splits work across machines | Used by every job (PySpark) |

## Code and automation

> **TL;DR:** the wheel is the code, the job is the recipe, the bundle ships both. Detail: [story 3.2](../stories/3.2-catalog-and-bundle-deploy.md#bundle-wheel-job)

| Term | In plain words | In this project |
|---|---|---|
| **Notebook** | An interactive page mixing code and results | Not used in production; fine for exploring |
| **Job** | A scheduled or on-demand run of one or more tasks, in order | `generate_and_ingest`, `transform_silver`, `build_gold` |
| **Task** | One step of a job | e.g. `reconcile_gl_pos`, then `finance_tables` |
| **Wheel** | Python code packaged as one installable file | `retail_finance_data-*.whl` |
| **Bundle** | One YAML project: code + jobs + target workspace, deployed like an app | `databricks.yml` in the data repo |
| **Service principal** | A non-human identity for automation | `terraform-platform` (to be split, [4.5](../stories/4.5-split-service-principals.md)) |

## Data and governance

> **TL;DR:** Unity Catalog is the library catalogue: where everything is, who may read it, where it came from.

| Term | In plain words | In this project |
|---|---|---|
| **Unity Catalog (UC)** | One permission and discovery system for all data | Governs everything below |
| **Metastore** | The top of UC, one per region | `metastore_aws_eu_central_1` |
| **Catalog → schema → table** | Three-level address, like database → folder → spreadsheet | `finance.gold.margin` |
| **Volume** | A governed folder for files (CSV, wheels) | `finance.raw.landing`, `finance.ops.artifacts` |
| **Delta table** | A table stored as files in S3, with transactions and history | Every Bronze/Silver/Gold table |
| **Storage credential / external location** | How UC is allowed into our S3 bucket (via an IAM role) | Bound to our workspace only ([2.4](../stories/2.4-unity-catalog-on-our-s3.md)) |
| **Grants** | Who may do what on which object | Analysts: read Gold only; engineers: everything |
| **Lineage** | Which tables were built from which | Gold → Silver → Bronze → file, recorded automatically |
| **Auto Loader** | Picks up only new files and loads them | Landing files → Bronze |
| **Medallion** | Bronze (raw) → Silver (clean) → Gold (ready) | [LLD 3](lld-data-platform.md#bronze-silver-gold) |

## Analytics, ML and AI

> **TL;DR:** SQL for people, MLflow for models, Genie and agents for questions in plain language.

| Term | In plain words | In this project |
|---|---|---|
| **SQL warehouse** | Compute dedicated to SQL queries and dashboards | Planned, for analysts and Genie |
| **Genie** | Ask a question in plain language, get SQL and an answer over chosen tables | Planned for analyst Q&A on Gold (stage 7) |
| **MLflow** | Tracks experiments, models and their versions | Planned for fraud and forecast models (stage 5) |
| **Model Serving** | Hosts a model or agent behind an API (serverless) | Planned for the agent (stage 7) |
| **Agent Framework** | Build, evaluate and trace AI agents with tools governed by UC | Planned: month-end variance commentary with human approval |

## Billing

> **TL;DR:** Databricks bills DBUs; AWS bills the machines and network separately.

| Term | In plain words | In this project |
|---|---|---|
| **DBU** | Databricks' unit of usage, billed per hour of compute | Covered by the USD 400 trial credit until 2026-10-06 |
| **Cloud cost** | EC2, S3, network endpoints in our AWS account | ~USD 2/day for the private network; EC2 only while jobs run |
