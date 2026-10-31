/* Landscape: every part as a tile, by layer. T(name, caption, status, steps, detail, mono). */
import type { Tile, View, Status } from "./types";

export const C: Record<string, string> = { people: "--people", agent: "--agent", gate: "--gate", data: "--data", ml: "--ml", know: "--know", base: "--base" };
const T = (n: string, c: string, s: Status, st: number[] = [], d = "", m = 0): Tile => ({ n, c, s, st, d, m });

export const ICON: Record<string, string> = {"Controller": "person", "Finance analysts": "person", "Engineers": "person", "Email (Amazon SES)": "ses", "gold.close_commentary": "databricks", "Power BI": "powerbi", "Vertex AI Agent Engine": "googlecloud", "Deep Agents": "langchain", "LangGraph + LangChain": "langgraph", "Gemini 3.8 Flash": "googlegemini", "Databricks managed MCP": "databricks", "AgentCore Gateway": "agentcore", "Lambda channels": "lambda", "Synthetic generator": "python", "Landing volume": "databricks", "Auto Loader": "databricks", "Bronze": "databricks", "Silver": "databricks", "Gold": "databricks", "Quality gates": "databricks", "GL vs POS reconciliation": "sql", "Gold certification": "databricks", "SQL warehouse": "sql", "finance.agent functions": "uc", "Agent tables": "databricks", "Isolation Forest": "scikitlearn", "Gradient boosting": "scikitlearn", "MLflow": "mlflow", "UC registry finance.ml": "mlflow", "PSI drift": "python", "Accuracy tracking": "mlflow", "Jobs + Asset Bundles": "databricks", "Daily orchestrator": "databricks", "Job clusters": "apachespark", "Serverless": "databricks", "Agent Engine": "googlecloud", "AWS Lambda": "lambda", "github-plan / github-deploy": "iam", "cheikh-platform-admin": "iam", "dbx-crossaccount": "iam", "dbx-unity-catalog": "iam", "…-agent-gcp": "iam", "terraform-platform": "databricks", "finance-data-deployer": "databricks", "finance-pipeline-runner": "databricks", "finance-month-end-agent": "databricks", "finance-close-notifier": "databricks", "Workload Identity Federation": "googlecloud", "finance-agent-deployer": "googlecloud", "finance-month-end-agent (SA)": "googlecloud", "GCP Secret Manager": "googlecloud", "AWS Secrets Manager": "aws", "GitHub secrets": "github", "VPC 10.20.0.0/16": "vpc", "PrivateLink": "vpc", "S3 gateway endpoint": "s3", "Security groups": "vpc", "CloudTrail + alarms": "cloudtrail", "VPC flow logs": "vpc", "ops.dq_results": "databricks", "ops.model_drift": "databricks", "Config drift": "githubactions", "Agent run output": "googlecloud", "Cloud Logging": "googlecloud", "AWS budget": "aws", "Databricks budget alerts": "databricks", "Tracing": "opentelemetry", "3 GitHub repos": "github", "GitHub Actions": "githubactions", "Terraform": "terraform", "Checkov · ruff · pytest": "pytest", "Dependabot": "dependabot", "Semantic release": "githubactions", "Unity Catalog": "uc", "Financial controller": "person", "Category manager": "person", "Pricing team": "person", "Accounts payable": "person", "Microsoft Teams": "teams", "SAP S/4HANA": "sap", "AI gateway": "agentcore", "Agent runtime": "googlecloud", "Orchestrator + sub-agents": "langgraph", "MCP tools": "mcp", "SLM": "meta", "LLM": "claude", "Deterministic tools": "python", "Document + entity pipeline": "python", "Vector index (RAG)": "databricks", "Knowledge graph (GraphRAG)": "neo4j", "Margin forecast": "scikitlearn", "Rebate tier forecast": "scikitlearn", "Anomaly scores": "scikitlearn", "Feature tables": "databricks", "Model serving": "mlflow", "Monitoring": "mlflow", "Bronze → Silver → Gold": "databricks", "Graph tables": "databricks", "Certified SQL functions": "sql", "Event backbone": "apachekafka", "CDC from SAP": "sap", "Schema registry": "apachekafka", "Stream processing": "apacheflink", "decisions topic": "apachekafka", "API gateway": "aws", "get_conditions · get_claims": "sap", "get_credit_notes · get_disputes": "sap", "Promotions tool": "sap", "Company SSO": "sso", "Workload identities": "sso", "Streams": "apachekafka", "Databricks": "databricks", "Private endpoints": "vpc", "OpenTelemetry traces": "opentelemetry", "Golden sets": "mlflow", "Release gates": "githubactions", "Audit trail": "cloudtrail", "SLOs + alerts": "opentelemetry", "Budgets per team": "agentcore"};

export const VIEWS: Record<string, View> = {
built: {
  sub: "What runs today, as built 2026-10-07 and reviewed 2026-10-29. Pick a step to see which parts one month-end run touches; pick a tile for detail. Synthetic data, EU regions only.",
  legend: [["s-built", "built and proven"], ["s-part", "built, partial"], ["s-rev", "in review"], ["s-gap", "missing"]],
  steps: [
    ["1", "Controller starts a run for a close month"],
    ["2", "Agent checks Gold is certified, calls functions over MCP"],
    ["3", "SQL warehouse runs the functions on Gold"],
    ["4", "Gemini plans, delegates, drafts"],
    ["5", "Draft submitted through the gateway; figures checked"],
    ["6", "Controller approves (one row)"],
    ["7", "Approved draft emailed and published to Power BI"],
  ],
  bands: [
    { h: "People and outputs", sm: "who asks, approves, reads", c: "people", g: [
      ["People", [T("Controller", "starts a run, approves drafts", "built", [1, 6], "Member of finance-controllers: the only group that may write finance.agent.approvals."),
                  T("Finance analysts", "read Gold in Power BI", "built", [], "Group finance-analysts: USE_SCHEMA + SELECT on gold only."),
                  T("Engineers", "change everything by pull request", "built", [], "No console changes; main is protected for admins too.")]],
      ["Outputs", [T("Email (Amazon SES)", "stand-in for Teams", "built", [7], "Only drafts with an approval row are sent."),
                   T("gold.close_commentary", "approved text for Power BI", "built", [7], "Written by the notifier identity after approval.", 1),
                   T("Power BI", "reads Gold and the commentary", "part", [7], "Target consumer; the tables are ready, no tenant in this project."),
                   T("CFO pack", "approved commentary", "part", [], "Simulated: the approved text is what would go in the pack.")]],
    ]},
    { h: "Agent", sm: "Google Cloud, europe-west1", c: "agent", g: [
      ["Runtime", [T("Vertex AI Agent Engine", "we ship code + requirements; Vertex builds the container; scale to zero", "built", [1], "The deploy script passes the agent object, requirements-google.txt and the month_end_agent package; the SDK uploads them to a staging bucket and Vertex builds and serves the container. min_instances = 0.")]],
      ["Framework", [T("Deep Agents", "supervisor + 3 sub-agents", "built", [4], "Commentary writer, alert triage, distributor. The supervisor plans its own to-do list and delegates."),
                     T("LangGraph + LangChain", "agent loop, model and MCP adapters", "built", [4], "langchain-google-genai for Gemini, langchain-mcp-adapters for the Databricks tools.")]],
      ["Model", [T("Gemini 3.8 Flash", "Vertex EU endpoint", "built", [4], "EU processing; no training on customer data.")]],
      ["Guardrails (outside the model)", [T("Certification check", "no run on uncertified Gold", "built", [2], "Code reads gold_certification_status before anything else."),
                     T("Figure check", "every number from a tool", "built", [5], "Done in the Lambda: a draft with a number not returned by a tool is rejected_by_check."),
                     T("Approval check", "no send without a row", "built", [7]),
                     T("No employee data", "functions return counts only", "built", [3], "Reviewed in agent_tools.sql; tested on every function.")]],
    ]},
    { h: "Tools and gateways", sm: "how the agent reads and sends", c: "gate", g: [
      ["Read", [T("Databricks managed MCP", "6 Unity Catalog functions", "built", [2], "OAuth M2M as finance-month-end-agent; EXECUTE on finance.agent functions only, no table grants.")]],
      ["Send", [T("AgentCore Gateway", "submit_draft · list_drafts · send_approved", "built", [5, 7], "IAM auth; only role …-agent-gcp may invoke it."),
                T("Lambda channels", "figure + approval checks", "built", [5, 7], "Runs SQL as finance-close-notifier through the Databricks SQL Statement API.")]],
      ["Model calls", [T("LLM gateway", "none: calls go straight to Vertex", "gap", [], "No central rate limits, cost per team or fallback model. AgentCore Gateway added these in Aug–Oct 2026; not used here.")]],
    ]},
    { h: "Data", sm: "Databricks on our AWS, eu-central-1", c: "data", g: [
      ["Sources", [T("Synthetic generator", "40 stores, 21 months, planted anomalies", "built", [], "GL journals, POS sales, refunds, products, budget, FX, cashiers, stores.")]],
      ["Ingest", [T("Landing volume", "one folder per source", "built"), T("Auto Loader", "new files only, schema tracked", "built")]],
      ["Medallion", [T("Bronze", "8 tables, 4.2m rows, as delivered", "built"), T("Silver", "typed, deduplicated, EUR", "built"), T("Gold", "revenue, margin, refunds, vs budget", "built", [3])]],
      ["Trust", [T("Quality gates", "12 checks per run", "built"), T("GL vs POS reconciliation", "4/4 fake journals found", "built"), T("Gold certification", "consumers read certified runs only", "built", [2])]],
      ["Serving", [T("SQL warehouse", "runs the agent's functions", "built", [3]), T("finance.agent functions", "aggregates only", "built", [2, 3], "", 1), T("Agent tables", "drafts · approvals · runs", "built", [5, 6])]],
    ]},
    { h: "ML", sm: "on certified Gold", c: "ml", g: [
      ["Models", [T("Isolation Forest", "cashier refunds: S017-C03 #1", "built"), T("Isolation Forest", "store margin drift: S031 #1", "built"), T("Gradient boosting", "vs seasonal baseline; baseline ships", "built")]],
      ["MLOps", [T("MLflow", "experiments, metrics", "built"), T("UC registry finance.ml", "registered models", "built"), T("PSI drift", "ops.model_drift", "built"), T("Accuracy tracking", "forecast vs actuals", "gap")]],
    ]},
    { h: "Compute and orchestration", sm: "nothing always on", c: "base", g: [
      ["Databricks", [T("Jobs + Asset Bundles", "deployed from the data repo", "built"), T("Daily orchestrator", "retries, failure email", "built"), T("Job clusters", "m6gd.large spot, policy finance-jobs", "built"), T("Serverless", "egress restricted to dbx-uc", "built")]],
      ["Google and AWS", [T("Agent Engine", "scale to zero", "built", [1]), T("AWS Lambda", "channels", "built", [5])]],
    ]},
    { h: "Identity and access", sm: "no stored cloud keys", c: "base", g: [
      ["AWS IAM", [T("github-plan / github-deploy", "OIDC from GitHub", "built", [], "", 1), T("cheikh-platform-admin", "break-glass, MFA, alarmed", "built", [], "", 1), T("dbx-crossaccount", "launch clusters in our VPC", "built", [], "", 1), T("dbx-unity-catalog", "read/write dbx-uc", "built", [], "", 1), T("…-agent-gcp", "InvokeGateway only, 1 h", "built", [5], "Trusted only for the runtime SA's Google ID token with audience retail-finance-agent-gateway.", 1)]],
      ["Databricks", [T("terraform-platform", "account admin (infra)", "built", [], "", 1), T("finance-data-deployer", "deploys bundles", "built", [], "", 1), T("finance-pipeline-runner", "jobs run as it; no GRANT", "built", [], "", 1), T("finance-month-end-agent", "EXECUTE functions only", "built", [2], "", 1), T("finance-close-notifier", "drafts, approvals, publish", "built", [5, 7], "", 1)]],
      ["Google", [T("Workload Identity Federation", "only data repo, main", "built"), T("finance-agent-deployer", "deploys the agent", "built", [], "", 1), T("finance-month-end-agent (SA)", "runs the agent", "built", [1, 4], "", 1)]],
      ["Secrets", [T("GCP Secret Manager", "agent's Databricks client", "built"), T("AWS Secrets Manager", "notifier's Databricks client", "built"), T("GitHub secrets", "Databricks client for CI", "built")]],
    ]},
    { h: "Network", sm: "private by default", c: "base", g: [
      ["AWS", [T("VPC 10.20.0.0/16", "no internet gateway, no NAT", "built"), T("PrivateLink", "to the Databricks control plane", "built"), T("S3 gateway endpoint", "data never leaves AWS", "built"), T("Security groups", "443, 6666, 8443-8451", "built")]],
      ["Cross-cloud", [T("Agent hops over the internet", "Google → Databricks, Google → AWS, TLS", "part", [2, 5], "Accepted in D-032; the AgentCore design keeps it private.")]],
    ]},
    { h: "Observability and cost", sm: "recorded, rarely alerted", c: "base", g: [
      ["Recorded", [T("CloudTrail + alarms", "root, break-glass → email", "built"), T("VPC flow logs", "to the audit bucket", "built"), T("ops.dq_results", "quality per run", "built", [], "", 1), T("ops.model_drift", "PSI per feature", "built", [], "", 1), T("Config drift", "nightly bundle plan", "built"), T("Agent run output", "tokens, output; no table", "built", [4], "", 1), T("Cloud Logging", "agent runtime logs", "built")]],
      ["Cost", [T("AWS budget", "USD 50/month, alerts", "built"), T("Databricks budget alerts", "100/200/300/380", "built")]],
      ["Missing (story 6.4)", [T("Dashboard", "one view, green or red", "gap"), T("Alerts", "freshness, drift, agent failures", "gap"), T("Tracing", "OpenTelemetry not switched on", "gap")]],
    ]},
    { h: "Delivery and governance", sm: "every change by PR", c: "base", g: [
      ["Delivery", [T("3 GitHub repos", "control plane, infra, data", "built"), T("GitHub Actions", "CI, gated deploy, drift", "built"), T("Terraform", "bootstrap, databricks, agent, gcp", "built"), T("Checkov · ruff · pytest", "checks on every PR", "built"), T("Dependabot", "weekly updates", "built"), T("Semantic release", "tag every merge (data PR #47)", "rev")]],
      ["Governance", [T("Unity Catalog", "grants to groups, lineage", "built"), T("Synthetic data only", "no real personal data", "built"), T("cmdb + ADRs + stories", "facts, decisions, how", "built")]],
    ]},
  ],
},
target: {
  sub: "The target picture for a margin recovery agent: “Where did we lose margin this month, why, and how much can we still recover before we close?” Not built. Green dot = this project already has it.",
  legend: [["s-here", "exists in this project"], ["s-target", "target only"]],
  steps: [
    ["1", "A margin signal arrives, or the controller asks in Teams"],
    ["2", "SLM triage keeps the real cases"],
    ["3", "OLAP: where and how much"],
    ["4", "ML: what margin should have been"],
    ["5", "RAG + GraphRAG: clause, links, owner"],
    ["6", "Live APIs: what is true right now"],
    ["7", "Tools size it; LLM explains; guardrails check"],
    ["8", "People approve claims, prices, accruals"],
    ["9", "Actions run; decisions flow back as events"],
  ],
  bands: [
    { h: "Users and targets", sm: "who asks, approves, receives", c: "people", g: [
      ["Approvers", [T("Financial controller", "asks; approves accruals", "here", [1, 8]), T("Category manager", "approves supplier claims", "target", [8]), T("Pricing team", "approves price fixes", "target", [8]), T("Accounts payable", "deductions", "target", [8])]],
      ["Channels and systems", [T("Microsoft Teams", "where the question is asked", "target", [1]), T("Suppliers (EDI, portal)", "claims, deduction notices", "target", [9]), T("SAP S/4HANA", "claims, prices, accruals (record)", "target", [9]), T("Power BI", "margin bridge, EUR recovered", "here", [9])]],
    ]},
    { h: "AI gateway and agent", sm: "plans, calls tools, writes", c: "agent", g: [
      ["Front door", [T("AI gateway", "AgentCore Gateway · Apigee · Databricks AI Gateway · LiteLLM", "target", [1], "Auth on behalf of the user, rate limits and cost per team, model routing and fallback, every call logged.")]],
      ["Agent", [T("Agent runtime", "AgentCore · Agent Engine, EU", "here", [1]), T("Orchestrator + sub-agents", "margin analyst, contract reader, evidence collector, writer", "here", [7]), T("MCP tools", "one protocol for every tool", "here", [3, 6])]],
      ["Models", [T("SLM", "Llama 3.2 3B · Phi · Gemma · Mistral Small", "target", [2], "Ranks hundreds of signals a day and extracts contract terms, inside the VPC."), T("LLM", "Claude · Gemini", "here", [7])]],
      ["Control", [T("Deterministic tools", "leak = expected − booked", "target", [7]), T("Guardrails", "figure check, clause cited, no claim without evidence", "here", [7])]],
    ]},
    { h: "Knowledge", sm: "contracts and links", c: "know", g: [
      ["Pipeline", [T("Document + entity pipeline", "OCR, chunk, embed; SLM extracts rates, tiers, deadlines", "target", [5])]],
      ["Retrieval", [T("Vector index (RAG)", "Databricks Vector Search · Bedrock KB · Azure AI Search", "target", [5]), T("Knowledge graph (GraphRAG)", "Neo4j · Neptune · graph tables", "target", [5], "supplier → contract → promotion → products → stores → claims → owner")]],
    ]},
    { h: "ML", sm: "forecasts and scores", c: "ml", g: [
      ["Models", [T("Margin forecast", "expected margin without leaks", "target", [4]), T("Rebate tier forecast", "purchases vs each tier", "target", [4]), T("Anomaly scores", "margin drift, waste, refunds", "here", [4])]],
      ["MLOps", [T("Feature tables", "offline + online", "target"), T("Model serving", "scores on demand", "target", [4]), T("Monitoring", "accuracy, drift", "here")]],
    ]},
    { h: "Lakehouse and OLAP", sm: "the trusted history", c: "data", g: [
      ["Layers", [T("Bronze → Silver → Gold", "margin by store, category, supplier", "here", [3]), T("Graph tables", "supplier, contract, claim, owner", "target", [5])]],
      ["Serving", [T("Certified SQL functions", "the OLAP tools", "here", [3]), T("Unity Catalog", "grants, lineage; supplier terms restricted", "here")]],
    ]},
    { h: "Event streaming and live APIs", sm: "what changed, what is true now", c: "gate", g: [
      ["Streaming", [T("Event backbone", "Kafka / MSK · SAP Event Mesh", "target", [1, 9]), T("CDC from SAP", "SLT · Datasphere · Debezium", "target", [1]), T("Schema registry", "the stream's data contract", "target"), T("Stream processing", "Flink · Spark: margin-signal rules", "target", [1]), T("decisions topic", "approved, rejected, paid → labels", "target", [9], "", 1)]],
      ["Live APIs", [T("API gateway", "quotas, caching, as_of on every answer", "target", [6]), T("get_conditions · get_claims", "SAP cost, price, claims now", "target", [6], "", 1), T("get_credit_notes · get_disputes", "money received, open disputes", "target", [6], "", 1)]],
    ]},
    { h: "Sources", sm: "seven systems", c: "base", g: [
      ["Systems", [T("SAP S/4HANA", "costs, prices, invoices, deductions", "target"), T("Promotions tool", "plans, supplier funding", "target"), T("Store POS", "sales, markdowns, refunds", "here"), T("Stock / WMS", "receipts, waste, shrink", "target"), T("Contracts (PDF)", "rebates, promotions, side letters", "target"), T("Claims history", "outcomes = labels", "target"), T("Supplier portal / EDI", "claim status, disputes", "target")]],
    ]},
    { h: "Around everything", sm: "identity, compute, monitoring, governance", c: "base", g: [
      ["Identity and access", [T("Company SSO", "people", "target"), T("On behalf of the user", "token exchange, no super-user", "target"), T("Workload identities", "no stored keys", "here")]],
      ["Compute and network", [T("Streams", "MSK + Flink", "target"), T("Databricks", "jobs, serverless SQL", "here"), T("GPU endpoint", "the SLM", "target"), T("Private endpoints", "EU regions only", "here")]],
      ["Observability and evaluation", [T("OpenTelemetry traces", "every step, tool call, token", "target"), T("Golden sets", "release gate for RAG and agent", "target"), T("SLOs + alerts", "with owners", "target")]],
      ["Governance and cost", [T("Audit trail", "every claim replayable", "here"), T("Budgets per team", "in the AI gateway", "target"), T("Release gates", "CI/CD", "here")]],
    ]},
  ],
},
eval: {
  sub: "How we would know each part works: the plain question, how we check it, and the indicator we track. Tests run on every PR, evaluations on every release, the same indicators in production. Targets are examples.",
  legend: [["s-built", "in place today"], ["s-part", "partly"], ["s-gap", "not yet"]],
  rows: [
    ["Data pipes", "data", [
      ["Did today's data arrive on time?", "Freshness check on Bronze (Lakehouse Monitoring or SQL alert)", "by 07:00 on 99% of days", "gap"],
      ["Is anything lost or duplicated?", "Row counts source → Bronze → Silver; key uniqueness", "lost = 0 · duplicates = 0", "built"],
      ["Are the numbers right?", "Quality gates + GL vs POS reconciliation", "gates 100% · gap EUR 0", "built"],
      ["Can consumers trust Gold today?", "Certification row per run", "certified before read: 100%", "built"]]],
    ["ML models", "ml", [
      ["Is the forecast better than a simple rule?", "Backtest vs seasonal baseline in MLflow", "model MAPE < baseline", "built"],
      ["Do the detectors find real cases?", "Planted or confirmed cases at the top", "precision@10 · confirmed ≥ 20%", "part"],
      ["Has the input data changed?", "PSI per feature", "PSI < 0.2", "built"],
      ["Is the model still accurate?", "Forecast vs actuals; registry age", "retrained < 2 months", "gap"]]],
    ["RAG", "know", [
      ["Does it find the right clause?", "Golden questions with the expected passage (Ragas, MLflow evaluate)", "top-5 recall ≥ 90%", "gap"],
      ["Is the answer backed by its source?", "Citation check + faithfulness judge", "citations 100% · faithful ≥ 95%", "gap"],
      ["Can someone read a contract they shouldn't?", "Query as a user without rights", "leaks = 0", "gap"]]],
    ["GraphRAG", "know", [
      ["Are suppliers, contracts, claims linked right?", "Extraction vs hand-checked sample", "entity F1 ≥ 0.9", "gap"],
      ["Do multi-hop answers match the truth?", "Questions SQL can answer, compared", "exact match ≥ 90%", "gap"]]],
    ["Agent", "agent", [
      ["Did it use the right tools, in order?", "Trace check on golden cases", "required tools 100%", "part"],
      ["Did it invent any number?", "Figure check against tool results", "grounded 100%", "built"],
      ["Did it cover what matters?", "Keywords, then LLM judge; a person samples", "coverage ≥ 90% · judge ≥ 4/5", "gap"],
      ["Can it be tricked?", "Prompt-injection and unapproved-send tests", "resisted 100%", "part"],
      ["Is it fast, reliable and cheap?", "Traces: OpenTelemetry → Cloud Trace, MLflow or Langfuse", "success ≥ 95% · p95 < 5 min · < EUR 0.50", "part"]]],
    ["Business", "people", [
      ["Is it useful to the controller?", "Approvals table with reasons", "approved without edits ≥ 60%", "part"],
      ["Is it on time, does it save time?", "Run and approval timestamps", "ready by close day 2", "gap"]]],
  ],
},
};
