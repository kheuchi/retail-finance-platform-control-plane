# ADR-005 · Orchestration and deployment: Terraform for the platform, Bundles and Jobs for workloads

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-003, D-011, D-022, D-026, D-031 · Stories: [1.2](../../stories/1.2-passwordless-cicd.md), [3.2](../../stories/3.2-catalog-and-bundle-deploy.md), [6.1](../../stories/6.1-scheduled-pipeline.md), [6.2](../../stories/6.2-drift-checks.md)

## TL;DR

| | |
|---|---|
| Decision | Terraform builds the platform (infra repo); Databricks Asset Bundles ship the jobs (data repo); Databricks Jobs orchestrate; GitHub Actions deploys, gated |
| Rejected | Airflow (MWAA), Step Functions, Lakeflow declarative pipelines, a pull-based GitOps controller |
| Main reason | Fewest moving parts that keep everything in code and reviewed |
| Main cost | Push deploys: a hand edit stays until the next deploy, so a nightly drift check is needed |

## Context

> **TL;DR:** two kinds of change, two owners, one rule: nothing by hand.

Platform changes (network, identities, grants) and workload changes (Spark jobs) have different
reviewers, risks and cadences. The orchestration need is a daily chain of four jobs.

## Options

| Option | For | Against |
|---|---|---|
| **Databricks Jobs + Asset Bundles** | Native retries, queueing, run-as identity, lineage per job; one YAML per job in Git | Tied to Databricks |
| Airflow (MWAA) | Standard cross-system orchestrator | A separate service to run and secure for four jobs; needs network paths into the workspace |
| Step Functions | Serverless, AWS-native | Same: one more integration for no gain at this size |
| Lakeflow declarative pipelines | Less code for streaming tables | Different deploy and test model; our plain PySpark was already proven in the private VPC |
| GitOps pull (Argo-style reconcile) | Reverts drift automatically | No such controller for Databricks workloads; push + drift check gives the signal |
| **Terraform** for the platform | The standard; plan before apply; state in S3 | Provider quirks (several documented in stories) |

## Decision

Terraform in two stacks (AWS foundation, Databricks) through OIDC-authenticated, gated workflows.
Bundles deploy jobs as `finance-data-deployer`; jobs run as `finance-pipeline-runner`. One
orchestrator job chains Bronze → Silver → Gold → ML on a schedule; a nightly `bundle plan` flags drift.

## Consequences

| Good | Bad |
|---|---|
| Every change is a reviewed pull request | Two tools to learn (Terraform, Bundles) |
| A hand edit is caught overnight (proved in 6.2) | Drift is reported, not reverted |
| Separation of duties by identity | Cross-system orchestration (SAP extract finished?) would need more |

## Revisit when

The chain spans several systems (SAP, iPaaS, BI refresh): then a cross-system orchestrator earns its place.
