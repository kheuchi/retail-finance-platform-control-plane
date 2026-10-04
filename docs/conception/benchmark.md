# Benchmark: data, ML and AI platform options

**Contents:** [TL;DR](#tldr) · [What we compare](#what-we-compare) · [Criteria](#criteria) · [Scores](#scores) · [When another option wins](#when-another-option-wins) · [Layer by layer](#layer-by-layer)

Day 0 · Conception · 2026-10-04. Previous: [stakeholders](stakeholders.md). Next: [ADRs](adr/README.md).
Detail: [`cmdb.yml`](../../cmdb.yml) → `conception.benchmark`.

## TL;DR

| Question | Answer |
|---|---|
| What kind of platform? | A **modern data platform** (also called a lakehouse platform): ingestion, storage, processing, governance, ML, GenAI and BI on one governed copy of the data |
| Options | Databricks on AWS · AWS-native · Snowflake + dbt + Airflow · Microsoft Fabric · Google BigQuery + Vertex AI · SAP-native |
| Winner for this case | **Databricks on AWS** (87/100), then AWS-native (75) and Google (74) |
| Why | One catalog for tables, files and models; ML and GenAI on the same governed data; open formats; runs in our own private network |
| Honest caveat | Scores are our judgement against stated criteria, from public documentation as of 2026-10; prices change and are not compared line by line. Databricks was the sponsor's starting requirement (D-004); the benchmark tests it |

## What we compare

> **TL;DR:** six realistic platforms a retailer's finance team would shortlist.

| Option | Made of |
|---|---|
| **A · Databricks on AWS** | Databricks (Delta, Unity Catalog, Jobs, MLflow) with compute in our VPC; Bedrock for LLMs |
| **B · AWS-native** | S3 + Glue/EMR (Spark) + Lake Formation + Redshift + SageMaker + Bedrock + Step Functions |
| **C · Snowflake stack** | Snowflake + dbt + Airflow + Snowpark/Cortex, or SageMaker for heavier ML |
| **D · Microsoft Fabric** | OneLake, Fabric Data Engineering and Warehouse, Power BI, Azure AI Foundry |
| **E · Google** | BigQuery + Dataform + Dataplex + Vertex AI (Gemini) |
| **F · SAP-native** | SAP Datasphere + SAP Analytics Cloud (SAP Business Data Cloud) |

## Criteria

> **TL;DR:** weighted for a finance team with strict controls and real ML and GenAI ambitions.

| Criterion | Weight | Why it matters here |
|---|---|---|
| Governance and lineage (one catalog for tables, files, models) | 15 | Auditors ask where every number comes from |
| Private networking, no public egress | 15 | Finance data before publication |
| ML and GenAI on the same governed data | 15 | Fraud, forecast and the agent are the point |
| SAP finance integration | 10 | The general ledger lives in SAP |
| Open formats, low lock-in | 10 | Data outlives tools |
| Operating effort (glue to build and run) | 10 | Small team |
| Cost model fit (pay per use, trial) | 10 | Portfolio budget, bursty jobs |
| Skills and market demand | 10 | Hiring and handover |
| Fit with our constraints (AWS account, Frankfurt, trial terms) | 5 | What we can actually run |

## Scores

> **TL;DR:** 1 = weak, 5 = strong; total = weighted, out of 100.

| Criterion (weight) | A Databricks | B AWS-native | C Snowflake | D Fabric | E Google | F SAP |
|---|---|---|---|---|---|---|
| Governance and lineage (15) | 5 | 3 | 4 | 4 | 4 | 4 |
| Private networking (15) | 4 | 5 | 4 | 3 | 4 | 3 |
| ML and GenAI on governed data (15) | 5 | 4 | 3 | 4 | 5 | 2 |
| SAP integration (10) | 3 | 3 | 3 | 3 | 3 | 5 |
| Open formats (10) | 5 | 4 | 3 | 4 | 3 | 2 |
| Operating effort (10) | 4 | 2 | 4 | 4 | 4 | 4 |
| Cost model fit (10) | 3 | 4 | 3 | 3 | 4 | 2 |
| Skills and market (10) | 5 | 4 | 5 | 4 | 3 | 3 |
| Fit with our constraints (5) | 5 | 5 | 3 | 1 | 1 | 1 |
| **Total / 100** | **87** | **75** | **72** | **70** | **74** | **60** |

**Sensitivity:** the ranking is not an artefact of the weights. With equal weights Databricks still
leads (raw sum 39 vs 34 for AWS-native and Google); without the "fit with our constraints" criterion,
which favours what we already run, it is 86 vs 74.

Short reasons:

| Option | Strongest point | Weakest point for us |
|---|---|---|
| A Databricks | Unity Catalog governs tables, volumes and models with lineage; Spark, MLflow, jobs in one place | Two vendors (AWS + Databricks); serverless runs outside our VPC; private networking is harder to debug |
| B AWS-native | Everything inside our account and network | Many services to glue together: catalog, Spark, warehouse, ML and orchestration are separate products |
| C Snowflake | Simplest SQL warehouse, strong governance | Private connectivity needs a higher edition; heavy ML usually leaves the platform |
| D Fabric | All-in-one SaaS, Power BI native | We are on AWS; capacity priced even when idle |
| E Google | BigQuery and Vertex AI are excellent together | Another cloud for an AWS-based company |
| F SAP-native | Best for SAP finance data and planning | ML and agents are not its strength; cost; lock-in |

## When another option wins

> **TL;DR:** the ranking depends on the company, and that is the honest answer in an interview.

| If the company is... | Likely winner |
|---|---|
| A Microsoft shop (Entra ID, Power BI, Azure) | D Fabric, or Azure Databricks |
| SAP-centric, mostly reporting, little ML | F SAP-native (SAP Business Data Cloud also embeds Databricks for ML) |
| SQL-first analytics team, ML elsewhere | C Snowflake |
| AWS-only policy, large platform team | B AWS-native |
| On Google Cloud already | E Google |

## Layer by layer

> **TL;DR:** what we use at each layer, and the realistic alternative.

| Layer | Chosen | Alternatives | ADR |
|---|---|---|---|
| Cloud | AWS Frankfurt | Azure, Google Cloud | [ADR-001](adr/ADR-001-cloud.md) |
| Storage format | Delta on S3 | Iceberg on S3, warehouse-native | [ADR-002](adr/ADR-002-data-platform.md) |
| Processing | Spark on Databricks job clusters | Glue, EMR, Snowflake SQL | [ADR-002](adr/ADR-002-data-platform.md) |
| Governance | Unity Catalog | Lake Formation + Glue catalog, Snowflake Horizon, Purview | [ADR-002](adr/ADR-002-data-platform.md) |
| Network | Classic compute in our VPC, PrivateLink, no NAT | Serverless, NAT gateway | [ADR-003](adr/ADR-003-compute-network.md) |
| Ingestion | File landing + Auto Loader | iPaaS, Fivetran, Lakeflow Connect, Kafka | [ADR-004](adr/ADR-004-ingestion-integration.md) |
| Orchestration and deploy | Databricks Jobs + Asset Bundles; Terraform | Airflow, Step Functions, Lakeflow pipelines | [ADR-005](adr/ADR-005-orchestration-deploy.md) |
| ML | scikit-learn + MLflow, UC model registry | SageMaker, Vertex AI | [ADR-002](adr/ADR-002-data-platform.md) |
| GenAI agent | Deep Agents (LangGraph) on AgentCore Runtime, Claude on Bedrock (EU) | Strands Agents, AgentCore Harness, Databricks Agent Framework, Bedrock Agents | [ADR-006](adr/ADR-006-agent-platform.md) |
| Agent tools and channels | MCP tools behind AgentCore Gateway | iPaaS, direct API calls, Agent Router (Envoy) | [ADR-006](adr/ADR-006-agent-platform.md) |
| BI | Power BI on Databricks SQL (not built) | Databricks AI/BI, SAP Analytics Cloud | — |
