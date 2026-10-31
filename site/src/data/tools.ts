/* Tool scorecard: T(name, icon, capability 1-10, fit 1-10, adoption 1-3, pick "" | "pick" | "planned" | "target", why).
   Scores are our opinion for this project, not a benchmark. */
import type { Cat, Tool } from "./types";

const T = (n: string, ic: string, cap: number, fit: number, ad: Tool["ad"], pick: Tool["pick"], why: string): Tool => ({ n, ic, cap, fit, ad, pick, why });

export const CATS: Cat[] = [
  { id: "lake", n: "Data platform", st: "built", kid: "The giant, tidy warehouse where every number of the shop is stored, cleaned and cooked into reports.", t: [
    T("Databricks", "databricks", 9, 9, 3, "pick", "Sponsor requirement, tested in our benchmark (ADR-002). Spark, ML, the catalog and an MCP server in one place, running in our own AWS network."),
    T("Snowflake", "snowflake", 9, 6, 3, "", "Excellent SQL warehouse, very easy to run. Python and ML came later, and the compute runs in Snowflake's account, not our network."),
    T("Google BigQuery", "googlebigquery", 8, 4, 3, "", "Great serverless SQL, but our platform lives on AWS; the data would be split across two clouds."),
    T("Microsoft Fabric", "fabric", 7, 4, 2, "", "Strong if the whole company is on Microsoft 365 and Power BI; younger, priced by capacity."),
    T("Amazon Redshift + Glue", "redshift", 6, 6, 2, "", "Native to AWS, but several services to glue together for ML, governance and notebooks.")] },
  { id: "tr", n: "Transformations", st: "built", kid: "The recipes that turn raw ingredients (files from the tills) into a cooked meal (clean, checked tables called Gold).", t: [
    T("Spark jobs + quality gates", "apachespark", 7, 7, 3, "pick", "Python and Spark we wrote, Auto Loader for the files, 12 quality checks. Full control and testable on a laptop, but tests, docs and lineage are ours to maintain."),
    T("dbt", "dbt", 8, 7, 3, "", "The industry default for SQL models, tests and docs. Honest view: a real finance team would probably write Silver → Gold in dbt or Lakeflow."),
    T("Lakeflow Declarative Pipelines", "lakeflow", 8, 8, 2, "", "Databricks' own pipelines with built-in quality rules. Not used: we wanted plain jobs we could unit-test locally."),
    T("SQLMesh", "sqlmesh", 7, 5, 1, "", "Like dbt, with smarter change plans; a smaller community."),
    T("Dataform", "dataform", 6, 2, 1, "", "Google's dbt-like tool; BigQuery only.")] },
  { id: "orch", n: "Orchestration", st: "built", kid: "The timetable: which job runs first, which waits, and who is told when one fails.", t: [
    T("Databricks Jobs", "databricks", 6, 9, 2, "pick", "A daily chain of four jobs inside one platform. No extra service to host and secure (D-031)."),
    T("Apache Airflow", "apacheairflow", 8, 5, 3, "", "The standard for pipelines across many systems; a whole service to run for four jobs."),
    T("Dagster", "dagster", 8, 5, 2, "", "Thinks in data assets, great developer experience; same extra service."),
    T("Prefect", "prefect", 7, 4, 1, "", "Python-first and light; another SaaS or server."),
    T("AWS Step Functions", "stepfn", 6, 5, 2, "", "Good for chaining AWS services, awkward for Databricks jobs.")] },
  { id: "ml", n: "ML tracking", st: "built", kid: "A lab notebook for models: which recipe was used, how good it was, and which version is the live one.", t: [
    T("MLflow", "mlflow", 8, 10, 3, "pick", "Built into Databricks and Unity Catalog, open source; every run, metric and model version is logged."),
    T("Weights & Biases", "weightsandbiases", 9, 5, 2, "", "The nicest experiment UI; a separate SaaS and bill."),
    T("Amazon SageMaker", "sagemaker", 8, 4, 2, "", "A full ML platform; it would duplicate what Databricks already gives us."),
    T("Vertex AI", "googlecloud", 8, 3, 2, "", "Same story on Google; our data is on AWS."),
    T("Kubeflow", "kubeflow", 6, 2, 1, "", "Needs a Kubernetes cluster; heavy for two models.")] },
  { id: "llm", n: "Language model", st: "built", kid: "The brain that reads the numbers the tools return and writes the text.", t: [
    T("Gemini (Vertex AI, EU)", "googlegemini", 8, 8, 3, "pick", "Picked because AWS held Bedrock at zero on our new account (D-032). EU endpoint, cheap, fast enough for a monthly report."),
    T("Claude", "claude", 9, 7, 3, "", "The original plan (D-029), on Bedrock in the EU. Blocked by the new-account hold, not by quality."),
    T("OpenAI GPT", "openai", 9, 5, 3, "", "Very capable; on neither of our clouds' native platforms without Azure."),
    T("Mistral", "mistralai", 7, 6, 2, "", "European company, EU hosting; smaller models."),
    T("Llama (self-hosted)", "meta", 6, 4, 2, "", "Open weights; we would host it ourselves. In the target it is a good small model (SLM) for sorting signals.")] },
  { id: "fw", n: "Agent framework", st: "built", kid: "The rule book that tells the AI how to plan, call tools and split the work between helpers.", t: [
    T("Deep Agents + LangGraph", "langgraph", 8, 8, 3, "pick", "Planning, sub-agents and a scratchpad out of the box, and not tied to one model: that saved us when we moved from Claude to Gemini."),
    T("Google ADK", "adk", 7, 7, 2, "", "Native to Agent Engine; ties the code to Google."),
    T("CrewAI", "crewai", 6, 5, 2, "", "Quick role-based crews; less control over each step."),
    T("LlamaIndex", "llamaindex", 7, 5, 2, "", "Strongest for reading documents (RAG); fits the target's knowledge layer."),
    T("Strands Agents", "strands", 6, 5, 1, "", "AWS's agent SDK; would fit AgentCore Runtime."),
    T("Microsoft Agent Framework", "msagent", 7, 3, 2, "", "Best on Azure and Microsoft 365.")] },
  { id: "rt", n: "Agent runtime", st: "built", kid: "The house the agent lives in: it starts it, gives it an identity and keeps its logs.", t: [
    T("Vertex AI Agent Engine", "googlecloud", 7, 6, 2, "pick", "Worked on day one with a keyless identity. The price: agent traffic crosses the internet instead of staying in our network (D-032)."),
    T("Bedrock AgentCore Runtime", "agentcore", 8, 8, 2, "", "The plan: inside our AWS network next to the gateway. Agent quota 0 on a new account."),
    T("Azure AI Foundry Agents", "foundry", 7, 2, 2, "", "Strong on Azure; a third cloud for us."),
    T("Cloud Run or Kubernetes", "kubernetes", 6, 4, 3, "", "Full control; we would build sessions, scaling and security ourselves.")] },
  { id: "gw", n: "Tool gateway", st: "built", kid: "The front desk between the agent and real systems: it holds the keys, checks the rules and writes everything down.", t: [
    T("AgentCore Gateway + Lambda", "agentcore", 8, 8, 2, "pick", "Send tools behind a gateway: credentials and policy live outside the model, and unapproved drafts are refused."),
    T("Databricks managed MCP", "databricks", 7, 9, 2, "pick", "Read tools: the agent may only run seven SQL functions that return totals, never raw rows."),
    T("API calls inside the agent", "python", 4, 5, 3, "", "Simplest, but secrets and rules end up inside the agent's code."),
    T("Apigee", "googlecloud", 7, 4, 2, "", "A full API gateway; the target uses one for live SAP APIs."),
    T("n8n / no-code flows", "n8n", 5, 3, 2, "", "Fast to wire up; weak on identity and audit for finance.")] },
  { id: "gov", n: "Catalog and access", st: "built", kid: "The school's key cabinet and register: who may open which room, and where every table came from.", t: [
    T("Unity Catalog", "uc", 8, 10, 2, "pick", "Grants, lineage and functions in one place; the agent gets permission to run functions and nothing else."),
    T("AWS Lake Formation", "lakeformation", 6, 4, 2, "", "Grants on AWS data, but not on Databricks objects."),
    T("Collibra", "collibra", 8, 4, 2, "", "Business glossary and data owners; sits on top of a catalog, not instead of one."),
    T("Google Dataplex", "dataplex", 6, 2, 1, "", "Google's catalog; our data is on AWS.")] },
  { id: "iac", n: "Infrastructure as code", st: "built", kid: "The building plans: the whole cloud set-up written as files, so it can be rebuilt and reviewed like code.", t: [
    T("Terraform", "terraform", 9, 9, 3, "pick", "One language for AWS, Databricks and Google (D-003); every change by pull request."),
    T("OpenTofu", "opentofu", 8, 8, 2, "", "The open-source fork of Terraform; a drop-in switch."),
    T("Pulumi", "pulumi", 8, 6, 2, "", "Real programming languages; a smaller Databricks community."),
    T("AWS CDK", "cdk", 7, 4, 2, "", "AWS only; Databricks and Google would need a second tool.")] },
  { id: "ci", n: "CI/CD", st: "built", kid: "The robot that tests every change and installs it, only after a person said yes.", t: [
    T("GitHub Actions", "githubactions", 8, 9, 3, "pick", "Our code is on GitHub; it logs in to AWS and Google with short-lived tokens, no stored keys."),
    T("GitLab CI", "gitlab", 8, 5, 3, "", "Equally capable; means moving the code."),
    T("Azure DevOps", "azuredevops", 7, 4, 2, "", "Common in Microsoft shops."),
    T("Jenkins", "jenkins", 7, 3, 3, "", "Self-hosted, plugin upkeep, keys to manage."),
    T("CircleCI", "circleci", 7, 5, 1, "", "Fast and simple; another vendor.")] },
  { id: "bi", n: "Dashboards", st: "built", kid: "The screens where managers look at the numbers and the approved commentary.", t: [
    T("Power BI", "powerbi", 8, 8, 3, "planned", "What finance teams already use next to Excel. Planned: not connected in the trial."),
    T("Tableau", "tableau", 8, 6, 3, "", "Beautiful analysis; a second licence where Microsoft 365 exists."),
    T("Looker", "looker", 7, 5, 2, "", "Strong semantic layer; best on Google."),
    T("Qlik", "qlik", 7, 5, 2, "", "Popular in retail; another licence."),
    T("Metabase", "metabase", 5, 6, 2, "", "Free and simple; light on governance.")] },
  { id: "aobs", n: "Agent observability", st: "target", kid: "A flight recorder for the AI: every step, every tool call, how many tokens, what it cost, and how good the answer was.", t: [
    T("Langfuse (self-hosted, EU)", "langfuse", 8, 9, 2, "target", "Open source, hosted by us in the EU: traces, cost per run, evaluations and prompt versions, on OpenTelemetry. Free tier next for the built agent."),
    T("Cloud Logging + Trace", "cloudtrace", 5, 7, 2, "pick", "What we have today on Agent Engine: runtime logs, no evaluations or cost per run. Kept for runtime logs."),
    T("Arize Phoenix", "phoenix", 7, 6, 2, "", "Great for evaluations in notebooks; Elastic License 2.0."),
    T("LangSmith", "langsmith", 8, 6, 2, "", "Best LangGraph integration; SaaS by default, self-hosting is enterprise-only."),
    T("Datadog LLM Observability", "datadog", 8, 4, 3, "", "Good if Datadog is already the company standard; expensive."),
    T("Braintrust", "braintrust", 7, 5, 1, "", "Strong evaluation workflow; SaaS.")] },
  { id: "mmon", n: "Model monitoring", st: "target", kid: "A health check for models: are they still right now that prices, stores and customers have changed?", t: [
    T("Lakehouse Monitoring + MLflow", "lakemon", 7, 9, 2, "target", "Built into Databricks; drift and quality metrics land in tables we already govern."),
    T("Our own PSI check", "python", 4, 8, 1, "pick", "Today: one drift number (PSI) computed in the ML job."),
    T("Evidently", "evidently", 7, 6, 2, "", "Open-source drift reports; one more thing to run."),
    T("SageMaker Model Monitor", "sagemaker", 6, 3, 2, "", "For models served on SageMaker, which ours are not.")] },
  { id: "iobs", n: "Infra observability", st: "target", kid: "The dashboard of the whole building: is anything slow, broken or costing too much?", t: [
    T("ClickStack", "clickhouse", 8, 8, 1, "target", "ClickHouse + HyperDX + an OpenTelemetry collector: logs, traces and metrics in one cheap, fast store."),
    T("Grafana LGTM", "grafana", 8, 8, 3, "", "Pick this instead if the company already runs Grafana."),
    T("CloudWatch + CloudTrail", "cloudwatch", 5, 8, 3, "pick", "Today: alarms on CloudTrail events and budgets. AWS only."),
    T("Datadog", "datadog", 9, 4, 3, "", "The most complete, the biggest bill."),
    T("Elastic", "elastic", 7, 5, 3, "", "Strong search over logs; heavier to run."),
    T("Splunk", "splunk", 8, 3, 3, "", "Security teams love it; priced for large companies.")] },
  { id: "evt", n: "Event streaming", st: "target", kid: "A live news feed between systems: every price change or sale is announced the second it happens.", t: [
    T("Apache Kafka (Amazon MSK)", "apachekafka", 9, 8, 3, "target", "The standard for change events from SAP; MSK runs it inside our AWS network."),
    T("Confluent Cloud", "confluent", 9, 6, 2, "", "Kafka with schema registry and connectors managed for us; a higher bill."),
    T("Amazon Kinesis", "kinesis", 6, 6, 2, "", "Simple on AWS; fewer SAP connectors."),
    T("Google Pub/Sub", "pubsub", 6, 3, 2, "", "Excellent on Google; our events start on AWS.")] },
];

export const PICKLBL: Record<string, string> = { pick: "Our pick", planned: "Planned", target: "Target pick" };
