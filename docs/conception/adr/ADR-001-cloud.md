# ADR-001 · Cloud: AWS Frankfurt, one account

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-004, D-009, D-010 → D-013, D-020 · Stories: [1.1](../../stories/1.1-aws-account-baseline.md), [2.1](../../stories/2.1-where-databricks-runs.md)

## TL;DR

| | |
|---|---|
| Decision | AWS, region eu-central-1 (Frankfurt), one account for now |
| Rejected | Azure, Google Cloud; Paris region; a multi-account landing zone today |
| Main reason | Databricks classic + PrivateLink and Bedrock models available in an EU region, inside a portfolio budget |
| Main cost | Single account: no account-level separation of prod, logs and security |

## Context

> **TL;DR:** EU data, private networking, managed LLMs in-region, and a small budget.

Finance data must stay in the EU and never cross the public internet. The last stage needs a
managed LLM in the same region. The budget is a USD 50/month AWS budget plus a Databricks trial.

## Options

| Option | For | Against |
|---|---|---|
| **AWS** | Databricks classic with back-end PrivateLink; Bedrock with EU model routing; largest market | Databricks is a second vendor on top |
| Azure | Azure Databricks is first-party; strong in Microsoft shops | The Azure trial forced a hybrid workspace with a billed NAT gateway (tried 2026-09-21) |
| Google Cloud | BigQuery + Vertex AI are strong | Databricks classic compute on Google ran on deprecated GKE at decision time |
| Region Paris (eu-west-3) | Close to the owner | Missing the model-serving features the agent stage needs |
| Multi-account (Organizations, Control Tower) | The enterprise standard | Creating an Organization ended the free-plan credits |

## Decision

AWS in eu-central-1, one account, with the multi-account design kept as the documented target.

## Consequences

| Good | Bad |
|---|---|
| One bill, one budget (Databricks via AWS Marketplace) | No account boundary between environments |
| Bedrock and Databricks in the same region | Vendor concentration on AWS |
| Frankfurt meets EU residency | |

## Revisit when

The company standardises on another cloud, or the project moves beyond a single environment
(then: Organizations with separate prod, non-prod, log-archive and security accounts).
