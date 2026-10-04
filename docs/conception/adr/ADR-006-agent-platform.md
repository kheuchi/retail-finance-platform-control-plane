# ADR-006 · AI agent platform: a job in our VPC, Bedrock (EU) over PrivateLink, human approval

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Requirements](#requirements) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-029 · To build: stage 7 · Docs: [business case](../business-case.md#ml-or-agent), [HLD](../../architecture/hld.md)

## TL;DR

| | |
|---|---|
| Decision | The agent is a Python job on our classic cluster, run as `finance-pipeline-runner`. It calls Claude on Amazon Bedrock through the Converse API, over a Bedrock PrivateLink endpoint, with an EU-only inference profile. AWS access comes from a Unity Catalog service credential. Tools are read-only SQL on certified Gold. Drafts wait for a controller's approval |
| Rejected | Bedrock Agents / AgentCore, Databricks Agent Framework on Model Serving, Genie, an agent framework from PyPI |
| Main reason | The only option where the agent, its data and its model calls all stay on paths we already control and prove |
| Main cost | We write the tool loop ourselves (~150 lines); no managed agent console |

## Context

> **TL;DR:** the agent reads finance data and writes for the CFO: it must be private, EU-only, read-only and supervised.

The agent drafts month-end commentary and triages alerts from certified Gold, model scores and
reconciliation exceptions ([business case](../business-case.md#use-cases)). Clusters have no internet
and no PyPI ([ADR-003](ADR-003-compute-network.md)). Bedrock in Frankfurt offers EU-only inference
profiles for current Claude models (checked 2026-10-04: `eu.anthropic.claude-sonnet-5`,
`eu.anthropic.claude-haiku-4-5`, `eu.anthropic.claude-opus-5-5`).

## Requirements

| # | Requirement | From |
|---|---|---|
| 1 | No public internet path for data or prompts | Security, ADR-003 |
| 2 | Model processing stays in the EU | GDPR, business case |
| 3 | Read-only on finance data; cannot post, pay or grant | AGENTS.md rule 7, internal control |
| 4 | Every figure in a draft traceable to a Gold row | Internal audit |
| 5 | Human approval before anything leaves finance | Controller, EU AI Act oversight |
| 6 | Runs from certified Gold only | Quality gates ([4.4](../../stories/4.4-quality-and-lineage.md)) |
| 7 | Deployed and scheduled like every other job | ADR-005 |

## Options

| Option | 1 Private | 2 EU | 3 Read-only | 7 Same deploy | Verdict |
|---|---|---|---|---|---|
| **Job in our VPC + Bedrock Converse over PrivateLink** | Yes (one more endpoint) | Yes (EU profile) | Yes (runner's grants + SELECT-only tools) | Yes (bundle) | **Chosen** |
| Bedrock Agents / AgentCore | Agent runtime outside our VPC; tools need Lambda plus a SQL path into Databricks | Yes | Depends on the tool Lambdas | No (separate stack) | Rejected: more moving parts, new data path |
| Databricks Agent Framework on Model Serving | Serverless, outside our VPC | Depends on the model | Yes (UC) | Partly | Rejected: runs where our network controls do not apply |
| Genie (AI/BI) | Serverless | — | Yes | — | Rejected: question answering for analysts, not a drafting workflow with approval |
| LangGraph / an agent SDK in the job | Yes | Yes | Yes | Needs vendored PyPI wheels on a no-internet cluster | Rejected for now: a framework is not needed for one agent with four tools |

## Decision

| Piece | Choice |
|---|---|
| Runtime | Job `month_end_agent` on the `finance-jobs` policy, run as the runner, after certified Gold |
| Model | Claude via `bedrock-runtime` Converse with tool use; EU inference profile, chosen at build time from those available |
| Network | Bedrock runtime interface endpoint in the endpoint subnets, private DNS, 443 from the workspace SG |
| AWS credentials | Unity Catalog **service credential** → IAM role allowed only `bedrock:InvokeModel` on EU Claude profiles; runner granted ACCESS; no instance profile, no stored key |
| Tools | Read-only, fixed SQL on `gold.*` (variance, reconciliation exceptions, fraud scores, forecast); no free SQL |
| Output | `ops.agent_drafts`: draft text, cited figures, status `pending_review`; a check compares every cited figure with Gold |
| Approval | A controller sets `approved` or `rejected` (simulated); nothing is sent anywhere by the agent |

## Consequences

| Good | Bad |
|---|---|
| Same network, identity and deploy story as the rest of the platform | Prompt and tool loop are our code to test and maintain |
| No data leaves AWS Frankfurt's EU routing | Bedrock endpoint ~USD 0.02/hour while it exists |
| Auditable: prompts, tool calls and drafts stored per run | Model access must be enabled in the Bedrock console once |

## Revisit when

There are several agents with shared tools and memory (then a framework or AgentCore), or Databricks
serverless offers private networking that meets [ADR-003](ADR-003-compute-network.md).
