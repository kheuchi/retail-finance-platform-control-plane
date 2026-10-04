# Architecture decision records

**Contents:** [TL;DR](#tldr) · [Index](#index) · [Format](#format)

Day 0 · Conception · 2026-10-04. Previous: [benchmark](../benchmark.md). Back to [business case](../business-case.md).
Detail: [`cmdb.yml`](../../../cmdb.yml) → `decisions` (each ADR links its D-xxx entries).

## TL;DR

| Question | Answer |
|---|---|
| What is an ADR? | One page per important decision: context, options, the choice, its consequences |
| ADR vs cmdb decision? | The cmdb keeps every decision as one line (D-001 …); an ADR holds the reasoning for the big ones |
| How many? | Six: the choices that would be expensive to reverse |

## Index

| ADR | Decision | Status | cmdb |
|---|---|---|---|
| [ADR-001](ADR-001-cloud.md) | AWS Frankfurt, one account | Accepted | D-004, D-009, D-013, D-020 |
| [ADR-002](ADR-002-data-platform.md) | Databricks lakehouse (Delta, Unity Catalog, MLflow) | Accepted | D-004, D-014b, D-021 |
| [ADR-003](ADR-003-compute-network.md) | Classic compute in our VPC, PrivateLink, no NAT | Accepted | D-015b, D-019, D-021 |
| [ADR-004](ADR-004-ingestion-integration.md) | File landing + Auto Loader in; iPaaS only on the way out | Accepted | D-025, D-030 |
| [ADR-005](ADR-005-orchestration-deploy.md) | Terraform for the platform, Asset Bundles + Databricks Jobs for workloads | Accepted | D-003, D-022, D-026, D-031 |
| [ADR-006](ADR-006-agent-platform.md) | Agent as a job in our VPC, Bedrock (EU) over PrivateLink, human approval | Accepted | D-029 |

## Format

Each ADR: **Context** (the forces) · **Options** (with pros and cons) · **Decision** · **Consequences**
(good and bad) · **Revisit when** (what would change our mind).
