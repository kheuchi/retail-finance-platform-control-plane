# ADR-006 · AI agent platform: a job in our VPC, Bedrock (EU) over PrivateLink, human approval

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Requirements](#requirements) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-029 · To build: [story 7.1](../../stories/7.1-month-end-agent.md) · Docs: [business case](../business-case.md#ml-or-agent), [HLD](../../architecture/hld.md)

## TL;DR

| | |
|---|---|
| Decision | The agent is a Python job on our classic cluster, run as **its own identity** `finance-month-end-agent`. It calls Claude on Amazon Bedrock (Converse API, EU-only inference profile) over a Bedrock PrivateLink endpoint. AWS access comes from a Unity Catalog service credential. Its tools are fixed, read-only queries on certified Gold, with no employee-level data. Drafts wait for a controller's approval |
| Rejected | Bedrock Agents / AgentCore, Databricks Agent Framework on Model Serving, Genie, an agent framework from PyPI |
| Main reason | Agent, data and model calls stay on paths we already control and prove; read-only is enforced by grants, not by code |
| Main cost | We write the tool loop (~150 lines) and the guardrails ourselves |

## Context

> **TL;DR:** the agent reads finance data and writes for the CFO: private, EU-only, read-only, supervised.

The agent drafts the month-end commentary from certified Gold, store-level model results and
reconciliation exceptions ([business case](../business-case.md#use-cases)). Clusters have no internet
and no PyPI ([ADR-003](ADR-003-compute-network.md)). Bedrock in Frankfurt lists EU-only inference
profiles for current Claude models (`aws bedrock list-inference-profiles`, 2026-10-04):
`eu.anthropic.claude-sonnet-5`, `eu.anthropic.claude-haiku-4-5-20251001-v1:0`, `eu.anthropic.claude-opus-5-5`.

## Requirements

> **TL;DR:** twelve rules the design must meet; each becomes a test or a grant.

| # | Requirement | Met by |
|---|---|---|
| 1 | No public internet path for data or prompts | Bedrock runtime interface endpoint; flow logs |
| 2 | Model processing in EU regions only | EU inference profile; IAM allows only EU ARNs |
| 3 | Read-only on finance data, enforced by identity | Own service principal: SELECT on named Gold tables, write on `ops.agent_drafts` and `ops.agent_runs` only |
| 4 | No employee-level data in the commentary (R-12) | Tools never return cashier IDs; cashier alerts stay with internal audit; at most a count is cited |
| 5 | Every figure traceable to a Gold row | Tools compute every figure (variances, percentages); the model may only quote them; a check rejects any number not returned by a tool |
| 6 | Free text from data cannot steer the agent (prompt injection) | Tools return structured fields; journal descriptions are excluded; the system prompt treats tool output as data |
| 7 | Human approval before anything leaves finance | Approvals in `ops.agent_approvals`, writable only by the controllers group; the agent cannot set them |
| 8 | Runs from certified Gold only | Same check as the ML job ([6.1](../../stories/6.1-scheduled-pipeline.md)) |
| 9 | Bounded cost and behaviour | Max 8 tool calls, max output tokens, run timeout; tokens and cost stored per run |
| 10 | Auditable | Prompt, tool calls, draft, model ID, tokens in `ops.agent_runs`; engineers and internal audit read; 365 days |
| 11 | Least-privilege model access | IAM role: `bedrock:InvokeModel` on the chosen profile and its EU foundation models only; endpoint policy limited to that role |
| 12 | Deployed and scheduled like every other job | Bundle job, deployer/run-as split ([ADR-005](ADR-005-orchestration-deploy.md)) |

## Options

> **TL;DR:** only the in-VPC job meets requirements 1, 3 and 12 without a new data path.

| Option | Private (1) | Read-only by identity (3) | Same deploy (12) | Verdict |
|---|---|---|---|---|
| **Job in our VPC + Bedrock Converse over PrivateLink** | Yes (one more endpoint) | Yes (own service principal) | Yes (bundle) | **Chosen** |
| Bedrock Agents / AgentCore | AgentCore Runtime can attach to a VPC, but tools need a new SQL path into Databricks | Depends on the tool code and its credentials | No: a separate stack | Rejected: new data path, second deploy model |
| Databricks Agent Framework on Model Serving | Serverless, outside our VPC (only the egress policy applies) | Yes (Unity Catalog) | Partly | Rejected: runs where our network proof does not reach |
| Genie (AI/BI) | Serverless | Yes | — | Rejected: question answering for analysts, not drafting with approval |
| LangGraph / an agent SDK in the job | Yes | Yes | Needs vendored PyPI wheels | Not now: one agent, five tools need no framework |

## Decision

> **TL;DR:** six pieces, two repos.

| Piece | Choice |
|---|---|
| Identity | Service principal `finance-month-end-agent` (infra): SELECT on `gold.daily_revenue`, `gold.budget_variance`, `gold.margin_alerts`, `gold.revenue_forecast`, `gold.recon_exceptions`; MODIFY on `ops.agent_drafts`, `ops.agent_runs`; ACCESS on the service credential; nothing else |
| Runtime | Job `month_end_agent` on the `finance-jobs` policy, run as that identity, after certified Gold |
| Model | Claude via `bedrock-runtime` Converse with tool use (non-streaming); EU profile chosen at build time from the list above |
| Network | Bedrock runtime interface endpoint in the endpoint subnets, private DNS, 443 from the workspace SG, endpoint policy limited to the role |
| AWS access | Unity Catalog service credential → IAM role. Policy: `bedrock:InvokeModel` on `arn:aws:bedrock:eu-central-1:<account>:inference-profile/<eu profile>` and on `arn:aws:bedrock:eu-*::foundation-model/<model id>` (an EU profile may route to any EU region). Trust: Unity Catalog with external ID, as in [2.4](../../stories/2.4-unity-catalog-on-our-s3.md). Policy simulator before apply |
| One-time setup | Anthropic first-use form and model subscription, done once by the human admin (may need `aws-marketplace` permissions on first call) |
| Output | `ops.agent_drafts` (status `pending_review` or `rejected_by_check`), `ops.agent_runs` (audit), `ops.agent_approvals` (controllers only) |

## Consequences

> **TL;DR:** consistent with the platform; more of our own code to test.

| Good | Bad |
|---|---|
| Same network, identity and deploy story as the rest | Tool loop, figure check and prompt are ours to test |
| Read-only and no-employee-data enforced by grants | A fourth service principal to manage and audit |
| Auditable per run | Bedrock endpoint ~USD 0.024/hour in 2 AZ (~17/month): built for the demo window, destroyed at teardown |
| Processing in EU regions on the AWS network | Not only Frankfurt: the EU profile may route to another EU region |

## Revisit when

> **TL;DR:** more agents, or private serverless.

Several agents share tools and memory (then a framework or AgentCore), or Databricks serverless
offers private networking that meets [ADR-003](ADR-003-compute-network.md).
