# ADR-006 · AI agent platform: Deep Agents in a container, on AgentCore, tools over MCP

**Contents:** [TL;DR](#tldr) · [Deviation (2026-10-07)](#deviation-2026-10-07-runs-on-google-agent-runtime-with-gemini) · [Context](#context) · [Requirements](#requirements) · [Options](#options) · [Decision](#decision) · [Portability](#portability) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 (revised the same day: framework and runtime) · **Deviation 2026-10-07** · cmdb: D-029, D-032 · To build: [story 7.1](../../stories/7.1-month-end-agent.md) · Docs: [business case](../business-case.md#ml-or-agent), [HLD](../../architecture/hld.md)

## TL;DR

| | |
|---|---|
| Decision | A **model-driven** multi-agent built with **Deep Agents** (LangChain, on the LangGraph runtime), shipped as a container, running on **Amazon Bedrock AgentCore Runtime attached to our VPC**. Tools and channels are **MCP** tools behind **AgentCore Gateway**; AgentCore **Identity** holds channel credentials, **Policy** decides who may call what. Model: Claude on Bedrock, EU inference profile |
| Principle | Free the reasoning, constrain the permissions: the LLM plans, delegates and chooses tools; what it *may* do is enforced outside the model (Unity Catalog grants, IAM, gateway policy, approval check) |
| Rejected | AgentCore Harness (preview, AWS-only API), a hand-written loop (first version of this ADR), Bedrock Agents (classic), Databricks Agent Framework on serverless, an AI gateway (Envoy / Agent Router) today |
| Main reason | Most adopted open framework, portable code and tool protocol, and a runtime that keeps the agent inside our network |
| Main cost | More moving parts (container, registry, gateway, ~6 more endpoints); Deep Agents is young and moves fast |

## Deviation (2026-10-07): runs on Google Agent Runtime with Gemini

> **TL;DR:** AWS holds Bedrock and AgentCore Runtime at zero for this new account, so the same agent runs on Google's managed runtime with Gemini; tools, guardrails and approvals are unchanged.

| | Designed (AWS) | Running (deviation) | Why |
|---|---|---|---|
| Runtime | AgentCore Runtime in our VPC | **Vertex AI Agent Engine (Agent Runtime)**, europe-west1 | AgentCore quota 0 for the account; Google's managed runtime runs LangGraph agents natively |
| Model | Claude on Bedrock (EU profile) | **Gemini 3.8 Flash** on Vertex AI's **EU** endpoint | Bedrock "Operation not allowed" (account verification); Claude on Vertex not granted yet; 3.8 Flash is the newest model the project may call in the EU |
| Finance tools | Managed MCP over PrivateLink | Same functions, managed MCP over the internet (TLS, OAuth M2M) | The runtime is outside the AWS VPC |
| Channel tools | AgentCore Gateway | **Unchanged** (AgentCore Gateway works) | Google's service-account identity assumes an AWS role by federation (no stored key); the role may only invoke the gateway |
| Agent secret | AWS Secrets Manager | GCP Secret Manager (EU) | Runtime-local secret store |
| Guardrails | Grants, figure check, approval check | **Unchanged** | They live in Databricks and the gateway Lambda, not in the runtime |

**What it costs:** the "no internet path" property no longer holds for the agent: model and tool calls cross
the internet, encrypted. What leaves AWS is store-level figures only (never cashier data), processed in the
EU; Vertex AI does not train on customer data. VPC Service Controls cannot lock the runtime down, because
it would also block the calls to Databricks and AWS.

**What it proves:** the portability table below, for real: same agent code and tools, another cloud's
runtime and model, by configuration. Back to the AWS design once AWS lifts the hold (one variable each).

## Context

> **TL;DR:** a real agent that plans and acts, for finance data, on a platform that may not stay on one cloud.

The agent drafts the close commentary, triages store-level alerts and reconciliation exceptions, and
distributes approved items to Teams, ServiceNow and the CFO pack ([business case](../business-case.md)).
An LLM-driven agent decides its own steps; a fixed graph or a capped loop would cap its usefulness and
need rebuilding as needs grow. The company may run agents on another cloud later.

Adoption on 2026-10-04 (GitHub stars / PyPI downloads per month): LangChain 147k / 170M, LangGraph
42.7k / 44M, Deep Agents 30k / 5.6M (since July 2025), Strands Agents 8.7k / 37M (downloads include
AWS's own automated pulls).

## Requirements

> **TL;DR:** the old guardrails stay; they move out of the agent's code into the platform.

| # | Requirement | Enforced by (outside the LLM) |
|---|---|---|
| 1 | No internet path from the agent | AgentCore Runtime in our private subnets; PrivateLink endpoints for Bedrock, AgentCore, ECR, logs |
| 2 | Model processing in EU regions | EU inference profile; IAM allows only EU ARNs |
| 3 | Read-only on finance data | Agent service principal `finance-month-end-agent`: EXECUTE on governed Unity Catalog functions over five Gold tables; no table writes except its own ops tables |
| 4 | No employee-level data (R-12) | The functions never return cashier IDs; cashier cases stay with internal audit |
| 5 | Every figure traceable | Functions compute every figure; a check rejects drafts with numbers no tool returned |
| 6 | Prompt injection from data | Functions return structured fields, no free text (journal descriptions excluded) |
| 7 | Nothing leaves before a person approves | Send tools (Gateway targets) check `ops.agent_approvals` themselves and refuse unapproved items; only `finance-controllers` can approve |
| 8 | Channel credentials never in the agent | AgentCore Identity (OAuth to Microsoft Graph, ServiceNow) |
| 9 | Who may call which tool | AgentCore Policy per agent; Unity Catalog grants per function |
| 10 | Bounded cost | Session timeout, token budget per run, recursion limit; tokens and cost logged |
| 11 | Auditable | AgentCore Observability (OpenTelemetry traces); drafts and tool calls in `ops.agent_runs`, 365 days |
| 12 | Portable | Open framework, container, MCP tools, model behind an abstraction ([portability](#portability)) |

## Options

> **TL;DR:** Deep Agents on AgentCore is the only option that is LLM-driven, portable and private at once.

| Option | LLM-driven | Portable | Private (in our VPC) | Verdict |
|---|---|---|---|---|
| **Deep Agents (LangGraph) container on AgentCore Runtime** | Yes: plans, to-do list, sub-agents, tool choice | Yes: same container on Kubernetes or another cloud | Yes: VPC-attached runtime | **Chosen** |
| Strands Agents on AgentCore Runtime | Yes (model-driven by design) | Yes (open source, multi-provider) | Yes | Good alternative; smaller community, centre of gravity on AWS |
| AgentCore Harness (AWS runs the loop) | Yes | No: the agent is an AWS API call | Partly | Rejected: public preview since April 2026, lock-in |
| Hand-written Converse loop (first version of this ADR) | Partly (capped tools and calls) | Yes | Yes | Rejected: not a real agent; we would rebuild it |
| Bedrock Agents (classic) | Yes | No | Partly | Rejected: AWS-only configuration, less control |
| Databricks Agent Framework on Model Serving | Yes | Partly | No: serverless | Rejected: outside our network proof |
| AI gateway (Envoy AI Gateway, now Agent Router) | — | Helps multi-cloud | Needs Kubernetes | Not now: one model provider; the option for multi-cloud ([revisit](#revisit-when)) |

## Decision

> **TL;DR:** one supervisor, three specialists, tools over MCP, approvals enforced by the send tools.

| Piece | Choice |
|---|---|
| Agents | Supervisor (`create_deep_agent`) that plans the close and delegates to sub-agents: **commentary writer**, **alert triage** (store margin, reconciliation exceptions), **distributor** (prepares channel messages, sends approved items) |
| Data tools | Unity Catalog SQL functions in `finance.agent` (read-only, governed, with lineage) over certified Gold, exposed as MCP tools (Databricks managed MCP server for UC functions; fallback: our own MCP server in the container querying a SQL warehouse in our VPC) |
| Channel tools | AgentCore Gateway targets (Lambda outside our VPC): `post_to_teams`, `open_servicenow_case`, `send_email`, `publish_commentary` (writes the approved text to `gold.close_commentary` for Power BI). Each refuses items not approved |
| Model | Claude on Bedrock via LangChain's Bedrock chat model, EU inference profile (e.g. `eu.anthropic.claude-sonnet-5`); swappable by configuration |
| Runtime | AgentCore Runtime in Frankfurt, attached to our private subnets; image built in CI (pinned versions), stored in ECR |
| Identities | Databricks: service principal `finance-month-end-agent`. AWS: AgentCore execution role (Bedrock EU ARNs, Gateway, logs). Channels: AgentCore Identity |
| Network | New endpoints: Bedrock runtime, AgentCore (data plane, gateway), ECR (api, dkr), CloudWatch Logs; existing: STS, S3 gateway, Databricks workspace (for the MCP server) |
| Human approval | Drafts and outgoing items in `ops.agent_drafts`; a controller approves in `ops.agent_approvals`; the next run's distributor sends only approved items |
| In this project | Teams and ServiceNow are the target; a stand-in channel (Slack or email) sits behind the same Gateway tool if no Microsoft 365 tenant is available |

## Portability

> **TL;DR:** four layers, each replaceable without rewriting the others.

| Layer | Today (AWS) | On another cloud |
|---|---|---|
| Agent code | Deep Agents container | Same container |
| Runtime | AgentCore Runtime | Kubernetes (EKS, AKS, GKE), Azure Container Apps, Cloud Run, LangGraph Platform |
| Tools and channels | MCP servers behind AgentCore Gateway | Same MCP servers behind another MCP gateway (e.g. Agent Router) |
| Model | Claude on Bedrock (EU) | Claude on Vertex AI or Microsoft Foundry, or another model, by configuration |
| Observability | AgentCore Observability (OpenTelemetry) | Any OpenTelemetry backend |

## Consequences

> **TL;DR:** a real, portable agent; more infrastructure and a young framework.

| Good | Bad |
|---|---|
| The LLM plans and delegates; no capped loop to rebuild later | Behaviour is less predictable: evaluation and traces become essential |
| Guardrails enforced by grants, IAM, policy and the send tools, not by prompts | More infrastructure: registry, gateway, runtime, ~6 endpoints (~USD 3.5/day in 2 AZ) |
| The only data that leaves our network is an approved message, through one audited gateway | Deep Agents' API changes quickly: versions pinned, upgrades reviewed |
| Moves to another cloud by changing the runtime and the gateway | AgentCore itself is AWS-specific (accepted: it is the replaceable layer) |

## Revisit when

> **TL;DR:** several model providers, several clouds, or a stable managed harness.

Models from several providers or clouds (then an AI gateway such as Agent Router, on Kubernetes);
AgentCore Harness reaches general availability with an export path; or the agent count grows enough
to need agent-to-agent (A2A) across teams.
