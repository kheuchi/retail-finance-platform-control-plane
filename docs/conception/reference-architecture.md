# Reference architecture: a fraud investigation agent

**Contents:** [TL;DR](#tldr) · [The questions](#the-questions) · [Business case](#business-case) · [Sources and targets](#sources-and-targets) · [Flow: sources to targets](#flow-sources-to-targets) · [The agent in the middle](#the-agent-in-the-middle) · [Layer by layer](#layer-by-layer) · [One run, end to end](#one-run-end-to-end) · [Design rules](#design-rules) · [What usually goes wrong](#what-usually-goes-wrong) · [Teams](#teams) · [How this project compares](#how-this-project-compares)

Day 0 · Conception · 2026-10-28. Target picture only: nothing in this file is built.
Previous: [benchmark](benchmark.md). Detail: [`cmdb.yml`](../../cmdb.yml) → `conception.reference_architecture`.

## TL;DR

| Question | Answer |
|---|---|
| What is this? | The full enterprise picture of an AI agent that uses **every** tool: lakehouse, event streaming, live APIs, ML (scores + forecast), OLAP, RAG, GraphRAG, an SLM, a human, and an LLM to tie it together |
| Which use case? | **Refund fraud rings** in the same fictional retailer: "Is this one organised group, how much have we lost, and what do we do now?" |
| Why not the ERP? | The ERP records each refund. It can't link refunds across stores, cards and loyalty accounts, compare them with a forecast, read the policy, and write a case file |
| The one idea | The LLM computes **no** numbers and accuses **nobody**. It asks the right systems, links the evidence, explains, and proposes; an investigator decides |
| Follows from | Our cashier fraud detectors ([story 5.1](../stories/5.1-fraud-detection.md)) and the month-end agent ([story 7.1](../stories/7.1-month-end-agent.md)) |
| Built here? | Lakehouse, batch fraud scores, a forecast, an LLM agent with human approval: yes. Streaming, live APIs, RAG, GraphRAG, SLM, real-time scoring: no ([comparison](#how-this-project-compares)) |

## The questions

> **TL;DR:** one main question for the investigator, broken into sub-questions; each one is answered by a different tool.

**Main question (loss prevention investigator):**

> **"Are these suspicious refunds across our stores the work of one organised group, how much have we lost, and what should we do now?"**

| Sub-question | Answered by |
|---|---|
| What just happened? | **Event streaming**: refund, payment and loyalty events of the last minutes |
| Is it abnormal? | **ML**: a real-time anomaly score per refund |
| How far above normal? | **ML forecast**: expected refunds per store and day; the excess is the suspected loss |
| How much, since when, where? | **OLAP** on Gold: 90 days of refunds and losses per store, till, card |
| Who is connected to whom? Have we seen this before? | **GraphRAG**: shared cards, phone numbers, loyalty accounts and tills; similar past cases |
| What is true right now? | **Live APIs**: card status and chargebacks at the payment provider, linked loyalty accounts, open cases, the till rota |
| What do the rules allow? | **RAG**: refund policy, investigation playbook, works agreement on staff monitoring |
| Which alerts deserve a look? | **SLM**: groups thousands of alerts, removes personal data, closes the obvious ones |
| So what do we do? | **LLM**: links it all, writes the case file, proposes actions |
| Who decides? | **Human**: the investigator approves; HR and the works agreement govern anything about an employee |

Two other questions the same architecture answers:

| Question | Domain |
|---|---|
| "Is this supplier's bank-account change genuine, or is someone trying to divert our payments?" | Supplier payment fraud: the ERP stores the new account; the agent checks it against the graph (shared with an employee? a known fraud account?), the live bank-verification API and the payment policy |
| "Will we miss this month's revenue forecast, and how much of the gap is fraud, shrinkage or real demand?" | Forecasting: the forecast and the fraud scores together, explained for the CFO before the close |

## Business case

> **TL;DR:** organised refund fraud spreads across stores and channels where no single report sees it; the agent links it in minutes, a person acts.

| Question | Answer |
|---|---|
| Problem | Return and refund fraud costs retailers about 1–2% of sales. Organised groups refund across many stores, channels and loyalty accounts, sometimes with the help of a cashier. Each refund looks normal alone |
| What exists today | POS rules (manager approval over a limit), a weekly loss report, investigators who search by hand across POS, payment, loyalty and case systems |
| Where the ERP stops | It records refunds; it doesn't link identities across systems, compare with a forecast, read the policy or explain a case |
| What the agent does | Starts on an alert, gathers evidence from every system, finds the group in the graph, sizes the loss, checks the rules, writes a case file and proposes actions |
| Who decides | The loss prevention investigator. Nothing about an employee happens without HR and the works agreement |
| Measured by | Time from first refund to case opened (days → minutes), losses stopped, false alerts per investigator per day, share of case files accepted without rework |
| Not the goal | Automatic blocking of customers or accusing employees by AI |

Terms: **loss prevention** = the team that investigates theft and fraud; **chargeback** = a card payment reversed by
the bank; **works agreement** = the contract with the works council on how staff data may be used (needed in Germany
for any monitoring, BetrVG §87).

## Sources and targets

> **TL;DR:** seven sources in, six targets out; events flow both ways.

### Sources

| Source | Gives | How it arrives | Freshness |
|---|---|---|---|
| Store POS | Sales, refunds, voids, manager overrides, till ID | Events (`pos-refunds`) | Seconds |
| E-commerce | Online orders, online returns brought to a store | Events | Seconds |
| Payment provider (Adyen, Worldline) | Card tokens, authorisations, chargebacks | Events + live API | Seconds |
| Loyalty / CRM | Accounts, phone numbers, addresses, account changes | CDC events + live API | Minutes |
| Workforce rota | Who was on which till (restricted personal data) | Live API, investigator only | Live |
| Case management history | Past cases and their outcomes: the **labels** for ML | Daily batch | Daily |
| Documents | Refund policy, investigation playbook, works agreement, past case reports | Document + entity pipeline | When a version changes |

### Targets

| Target | Receives | After |
|---|---|---|
| **Investigator** | Case file with evidence, loss estimate and proposed actions | The agent |
| **Case management** (ServiceNow) | A pre-filled case | Investigator approval |
| **Payment provider / POS** | Refund hold on the card tokens involved (reversible) | Investigator approval |
| **Store managers** | An alert: pattern, tills, times; no employee names | Investigator approval |
| **Finance close** | A loss provision for the month (links to our month-end agent) | Investigator approval |
| **Power BI** | Losses, alerts, cases, false-alert rate | Reads Gold |
| **Event backbone** (back in) | Decision and reason | Every decision; becomes the next training label |

## Flow: sources to targets

> **TL;DR:** data flows left to right through streaming, lakehouse, ML and knowledge; every tool call passes one gateway.

![Refund fraud: sources to targets](reference-architecture-flow.png)

| Column | Holds |
|---|---|
| 1 · Sources | The seven systems above |
| 2 · Event streaming | Event backbone, stream processing, the document and entity pipeline, the API gateway for live reads |
| 3 · Lakehouse | Bronze → Silver (pseudonymised) → Gold, feature tables, graph tables, certified SQL functions |
| 4 · ML | Real-time anomaly score, refund forecast, graph features, monitoring, serving |
| 5 · Knowledge | Vector index (RAG), knowledge graph (GraphRAG) |
| 6 · Agent | SLM triage, LLM agent, guardrails |
| 7 · Targets | The investigator first, then the systems that act |

Source: [reference-architecture-flow.drawio](reference-architecture-flow.drawio).

## The agent in the middle

> **TL;DR:** one trigger, nine kinds of evidence, one case file, one human decision.

![The agent in the middle](reference-architecture-agent.png)

The agent plans, then delegates to sub-agents: a **data analyst** (OLAP, ML), a **link investigator** (GraphRAG,
live APIs), a **policy reader** (RAG) and a **case writer**. Source:
[reference-architecture-agent.drawio](reference-architecture-agent.drawio).

## Layer by layer

> **TL;DR:** each layer has one job, one owner and one interface the agent may use.

### Event streaming

> **TL;DR:** fraud is fast; the stream sees each refund in seconds, scores it and raises alerts.

| Component | Practice |
|---|---|
| Event backbone | Kafka (Amazon MSK, Confluent); topics `pos-refunds`, `payments`, `chargebacks`, `loyalty-changes`, `fraud-alerts`, `decisions` |
| Schema registry | Versioned schema per topic; breaking changes rejected (the data contract of the stream) |
| Stream processing | Flink or Spark Structured Streaming: per card, till and account, counts and amounts over the last minutes and hours; calls the real-time score; publishes `fraud-alerts` |
| Into the lakehouse | Streaming ingest into Bronze; streaming tables where freshness matters |
| Back out | Decisions published to `decisions`: audit, evaluation and the next labels |

### Lakehouse and OLAP

> **TL;DR:** the trusted history, pseudonymised, with the links the graph needs.

| Component | Practice |
|---|---|
| Bronze → Silver → Gold | Quality gates; personal identifiers **pseudonymised** in Silver (cashier, card, phone become tokens) |
| Graph tables | Nodes (card, loyalty account, phone, address, till, store, pseudonymised cashier) and edges (used, refunded at, shares) |
| Certified SQL functions | The OLAP tools: refunds by store, till, card and day; losses; case outcomes |
| Governance | Unity Catalog: grants, lineage, column masks; re-identifying a cashier only for the investigator role, logged |

### ML: scores and forecast

> **TL;DR:** a score says "odd", a forecast says "how much more than normal"; both are needed.

| Model | Practice |
|---|---|
| Real-time anomaly score | Gradient boosting or isolation forest on stream features; online endpoint, milliseconds per refund |
| Refund forecast | Expected refunds per store and day (seasonality, promotions, holidays); the excess over the forecast interval is the suspected loss |
| Graph features | Community size, shared identifiers, distance to a known fraud case; fed to the score |
| Labels | Past case outcomes from case management; the agent's decisions add new ones |
| Monitoring | Precision at the top alerts, drift, false alerts per investigator |

### RAG

> **TL;DR:** what the rules say, cited, filtered by who is asking.

| Component | Practice |
|---|---|
| Content | Refund policy, investigation playbook, works agreement, data protection rules |
| Index | Databricks Vector Search, Bedrock Knowledge Bases or Azure AI Search; chunks with document, section, version |
| Rights | The index applies the source's access rights at query time |
| Answers | Cite document, section and version; "no source found" is a valid answer |

### GraphRAG

> **TL;DR:** RAG finds passages; GraphRAG finds **connections**. Fraud rings are connections.

| Component | Practice |
|---|---|
| What it is | Retrieval over a knowledge graph: entities, their links, and LLM-written summaries of each community, instead of only text chunks |
| Graph | Built from the graph tables (structured links) plus entities that the SLM extracts from past case reports |
| Store | Neo4j, Amazon Neptune, or graph tables in the lakehouse (GraphFrames) |
| Query | "Which accounts share a card or phone with these refunds?" → subgraph; "Which past case looks like this?" → community summary with case references |
| Why not plain RAG | Plain RAG returns similar text; it can't follow "card A → account B → phone C → account D" |

### SLM

> **TL;DR:** a small language model does the high-volume, low-judgement work, cheaply and inside our network.

| Use | Why an SLM |
|---|---|
| Triage thousands of alerts a day: group, deduplicate, close the obvious | Volume: an LLM call per alert costs too much |
| Remove personal data before anything reaches the LLM | Runs in our VPC, so the data doesn't leave |
| Extract entities from case reports for the graph | A narrow task, fine-tuned once |
| Examples | Llama 3.2 3B, Phi, Gemma, Mistral Small; served on our own GPU or a private endpoint |

### LLM agent

> **TL;DR:** plans, calls tools, links evidence, writes; never calculates, never decides.

| Component | Practice |
|---|---|
| Trigger | A grouped alert from the SLM, or an investigator's question |
| Orchestrator | Plans and delegates to sub-agents (data analyst, link investigator, policy reader, case writer) |
| Tools | Via **MCP** (Model Context Protocol) behind one gateway: auth on behalf of the user, policy per tool, every call logged |
| Guardrails | Figure check (every number from a tool), no employee names in outputs, citations required, prompt-injection filter on documents |
| Runtime | AgentCore, Vertex AI Agent Engine or Azure AI Foundry, in the data's region |

### Human-in-the-loop

> **TL;DR:** the agent proposes; the investigator decides; employees are protected by process.

| Action | Who decides |
|---|---|
| Open a case, alert store managers | Investigator |
| Hold refunds on card tokens (reversible) | Investigator; later possibly automatic below a threshold after months of evidence |
| Anything about an employee | Investigator + HR, under the works agreement; never automatic (GDPR Art. 22: no decision with significant effect by automation alone) |
| Loss provision | Financial controller, in the close |

### Cross-cutting

> **TL;DR:** identity, privacy, observability, evaluation, cost.

| Concern | Practice |
|---|---|
| Privacy | DPIA, works agreement, pseudonymisation, purpose limitation, retention limits |
| Identity | Workload identities, no stored keys; tools run on behalf of the investigator |
| Observability | Traces of every step (prompt, tool calls, tokens); stream lag; model drift |
| Evaluation | Past cases with known outcomes; run on every prompt, model or tool change |
| Cost | SLM for volume, LLM only for hard cases; token budgets per case |
| AI governance | EU AI Act classification, model and agent inventory, audit trail |

## One run, end to end

> **TL;DR:** an alert at 02:14 becomes a case file at 02:31 and a decision at 08:10.

| # | Time | Who | Does | Gets |
|---|---|---|---|---|
| 1 | 02:14 | Stream job | Refunds at stores 214, 219, 231 jump; anomaly scores high | 37 alerts on `fraud-alerts` |
| 2 | 02:15 | SLM | Groups the 37 alerts into 1 case, removes names, closes 4 duplicates | 1 hard case for the LLM |
| 3 | 02:16 | OLAP | `refunds_by_card_store(90 days)` | 212 no-receipt refunds, EUR 58,900, 6 weeks |
| 4 | 02:17 | ML forecast | `expected_refunds(stores, 6 weeks)` | EUR 17,600 expected → excess **EUR 41,300** (computed by a tool) |
| 5 | 02:18 | GraphRAG | `linked_entities(refund cards)` | 6 loyalty accounts, 3 card tokens, 2 phone numbers; 80% at 2 tills; looks like case 2025-114 |
| 6 | 02:20 | Live APIs | Payment provider; loyalty | 2 cards already have chargebacks; 4 accounts created in the last 2 months |
| 7 | 02:21 | RAG | `search_policy("no-receipt refund")` | Refund policy §3: over EUR 50 needs a manager override; works agreement §5: staff findings go to HR |
| 8 | 02:31 | LLM | Writes the case file; guardrails check every figure and remove names | Proposal: hold 3 card tokens, open a case, alert 3 store managers, provision EUR 41k |
| 9 | 08:10 | Investigator | Approves; sends the till pattern to HR under the works agreement | Case opened, tokens held, managers alerted; `decisions` event published |

Without the agent, the weekly loss report would have shown it the following Monday, store by store, without the links.

## Design rules

> **TL;DR:** ten rules that separate a demo from a production agent.

1. **Numbers come from tools**, never from the model; a figure check enforces it.
2. **The AI accuses nobody:** it describes patterns; people decide about people.
3. **Each fact from its owner:** history from Gold, now from the live API, links from the graph, rules from the documents, "normal" from the forecast.
4. **Show freshness and sources:** every figure carries its `as_of` and origin.
5. **SLM for volume, LLM for judgement.**
6. **Pseudonymise first;** re-identify only for the investigator, and log it.
7. **Read-only by default;** every action through the gateway and a human.
8. **Event-driven:** the agent starts on an alert; nothing polls the POS or SAP.
9. **Evaluate before release** on past cases with known outcomes.
10. **Trace everything,** so an auditor or a court can replay why a case was opened.

## What usually goes wrong

> **TL;DR:** most failures are data, privacy and process, not the model.

| Failure | Cause | Prevention |
|---|---|---|
| Innocent customer flagged | Score alone, no link evidence | Graph + forecast + human before any action |
| Employee named by the AI | Names in context or output | Pseudonymisation, guardrail, works agreement process |
| Alert flood | One busy Saturday raises thousands of alerts | SLM grouping, thresholds tuned on the forecast |
| Wrong loss amount | Model did the arithmetic | Deterministic tool, figure check |
| Graph out of date | Loyalty changes loaded weekly | CDC events, graph updated from the stream |
| Prompt injection | A case report contained instructions | Retrieved text treated as data; output guardrails |
| Labels never improve | Decisions not captured | `decisions` topic, reason required |

## Teams

> **TL;DR:** the same two-team model as in this project, plus loss prevention and the guardians.

| Team | Owns |
|---|---|
| Fraud data & AI product team | Gold, graph tables, scores, forecast, tools, agent, evaluation |
| Data & AI platform team | Lakehouse, event backbone, serving, vector and graph stores, SLM hosting, agent runtime, gateway |
| Loss prevention | Investigations, approvals, feedback, the playbook |
| DPO, works council, HR | Privacy, the works agreement, anything about employees |
| Integration team | POS, payment provider, loyalty and case management interfaces |

## How this project compares

> **TL;DR:** we built the lakehouse, batch fraud scores, a forecast and a governed agent; not streaming, live APIs, RAG, GraphRAG, the SLM or real-time scoring.

| Layer | Here | Status |
|---|---|---|
| Lakehouse + OLAP | Bronze/Silver/Gold, quality gates, certification; agent reads certified SQL functions | ✅ Built |
| ML: fraud scores | Two Isolation Forest detectors: **cashier refunds** and store margin drift, monthly, no labels | 🟡 Batch; no real-time score, no graph features |
| ML: forecast | Revenue forecast that must beat a baseline | 🟡 Built, but revenue, not refunds |
| Event streaming | Daily files with Auto Loader | ❌ Not built |
| Live APIs | None; the gateway carries actions (drafts, approved emails) | ❌ Not built |
| RAG | None | ❌ Not built |
| GraphRAG | None | ❌ Not built |
| SLM | None; one LLM (Gemini) does everything | ❌ Not built |
| LLM agent | Supervisor + 3 sub-agents, figure check, store-level only (no cashiers) | ✅ Built |
| Human-in-the-loop | Controller approves each draft | ✅ Built |
| Privacy | Agent sees no cashier data; DPIA and works agreement described | ✅ Designed and enforced in grants |

Built detail: [story 5.1](../stories/5.1-fraud-detection.md), [story 7.1](../stories/7.1-month-end-agent.md),
[ADR-006](adr/ADR-006-agent-platform.md).
