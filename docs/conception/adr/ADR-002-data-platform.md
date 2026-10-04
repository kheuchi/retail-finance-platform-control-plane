# ADR-002 · Data and ML platform: Databricks lakehouse

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-004, D-014b, D-021 · Benchmark: [scores](../benchmark.md#scores) · Docs: [LLD 3](../../architecture/lld-data-platform.md), [primer](../../architecture/databricks-primer.md)

## TL;DR

| | |
|---|---|
| Decision | Databricks Enterprise on AWS: Delta tables, Unity Catalog, Spark jobs, MLflow and its model registry |
| Rejected | AWS-native (Glue/EMR + Redshift + SageMaker), Snowflake stack, Fabric, Google, SAP-native |
| Main reason | One governed catalog with lineage for tables, files and models, with ML on the same data |
| Main cost | A second vendor; DBU costs on top of EC2 |

## Context

> **TL;DR:** finance needs lineage and controls; the roadmap needs ML and an agent on the same data.

Auditors must trace a reported number to its source. The fraud models and the agent must read only
certified data. A small team cannot glue five services together and keep them consistent.

## Options

| Option | For | Against |
|---|---|---|
| **Databricks** | Unity Catalog: grants, lineage, audit for tables, volumes, models; Spark + MLflow + jobs; open Delta format | Two vendors; serverless runs outside our VPC (we use classic compute) |
| AWS-native | All inside our account; pay per use | Catalog, Spark, warehouse, ML and orchestration are separate products to integrate and secure |
| Snowflake + dbt + Airflow | Simple SQL, strong governance | Private connectivity needs a higher edition; heavy ML usually leaves the platform |
| Microsoft Fabric | SaaS, Power BI native | Wrong cloud for us; capacity billed when idle |
| SAP Datasphere / SAC | Best SAP fit | Weak for ML and agents; lock-in |

## Decision

Databricks on AWS, Enterprise tier (required for PrivateLink), signed up through AWS Marketplace so
charges sit inside the AWS budget.

## Consequences

| Good | Bad |
|---|---|
| Lineage from Gold to source file proved in one query ([4.4](../../stories/4.4-quality-and-lineage.md)) | Trial ends 2026-10-06: teardown forced by the vendor's terms |
| One permission model for analysts, jobs and models | Some features (serverless, model serving) sit outside our network |
| Skills widely available | DBU pricing is another bill to watch (budget alerts in Databricks too) |

## Revisit when

The company is SAP-centric with little ML (consider SAP Business Data Cloud), or a Microsoft shop
(consider Fabric or Azure Databricks).
