# Cloud equivalents: this stack on AWS, Azure and Google Cloud

**Contents:** [TL;DR](#tldr) · [How to read it](#how-to-read-it) · [Region and foundation](#region-and-foundation) · [Network](#network) · [Audit and alerts](#audit-and-alerts) · [Data platform](#data-platform) · [ML](#ml) · [Agent](#agent) · [Delivery and BI](#delivery-and-bi) · [Target components (not built)](#target-components-not-built) · [What does not map one to one](#what-does-not-map-one-to-one)

Updated 2026-11-03. What we built: [HLD](../architecture/hld.md). Why these picks: [benchmark](../conception/benchmark.md), [ADRs](../conception/adr/README.md), [story 2.1](../stories/2.1-where-databricks-runs.md). Detail: [`cmdb.yml`](../../cmdb.yml) → `decisions`, `architecture`.

> 🌐 **Our pick vs competitors, per category:** the [tool scorecard](https://kheuchi.github.io/retail-finance-platform-control-plane/landscape/tools.html) in the web app.

## TL;DR

| Question | Answer |
|---|---|
| 🧩 What is our stack? | AWS (account, network, audit, Lambda, email) + Databricks (lakehouse, jobs, ML, catalog) + Google Cloud (the agent's runtime and model) + GitHub (code, CI) |
| 🔁 Can it move to Azure or Google Cloud? | Yes. Databricks runs on all three clouds, so the cheapest move keeps Databricks and swaps only the cloud underneath (foundation, network, audit, functions, email) |
| 🏗️ And without Databricks? | Every cloud has the parts, but splits them over two or three services each. Unity Catalog (one catalog for tables, files, models and functions) has no single native twin |
| 🤖 The agent? | Proven portable: it moved from AWS AgentCore + Claude to Google Agent Engine + Gemini by configuration (D-032) |
| ⚠️ Caveat | Names as of November 2026. Cloud vendors rename often, so check the vendor's page before quoting a name |

## How to read it

> **TL;DR:** one row per component; **bold** marks what we run.

- **Ours:** what runs in this project. *Designed* means built in code but not running (AWS held Bedrock and AgentCore Runtime at zero, D-032).
- **AWS / Azure / Google Cloud:** the closest service on each cloud. Where we already use that cloud, the cell repeats our pick in **bold**.
- For the data platform rows, the cloud columns mean "cloud-native, without Databricks".

## Region and foundation

> **TL;DR:** one account, keyless CI, everything in Terraform; every cloud has the same three ideas.

| Component | Ours | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| EU region (Frankfurt) | eu-central-1 | **eu-central-1** | Germany West Central | europe-west3 (agent: europe-west1, Belgium) |
| Boundary for cost and access | One AWS account | **AWS account**; Organizations + Control Tower at scale | Subscription in a management group | Project in a folder of an organisation |
| Human sign-in | Named IAM user, never root | **IAM**; IAM Identity Center at scale | Microsoft Entra ID | Cloud Identity |
| CI without stored keys | GitHub OIDC → IAM roles (plan, deploy) | **IAM OIDC provider + roles** | Entra workload identity federation | Workload Identity Federation |
| Infrastructure as code | Terraform, state in S3 | **Terraform**; native: CloudFormation, CDK | Terraform; native: Bicep | Terraform; native: Infrastructure Manager |
| Guardrails | Least-privilege roles, cluster policies | SCPs, AWS Config | Azure Policy | Organization Policy |
| Budget alerts | AWS Budgets + Databricks budget | **AWS Budgets** | Cost Management budgets | Cloud Billing budgets |
| Secrets | Secrets Manager, GitHub secrets | **Secrets Manager** | Key Vault | Secret Manager |

## Network

> **TL;DR:** a private network with no internet path; Databricks reached over a private link.

| Component | Ours | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| Private network | VPC with no internet gateway and no NAT | **VPC** | VNet (VNet injection for Azure Databricks) | VPC (customer-managed VPC for Databricks) |
| Private link to Databricks | Back-end PrivateLink | **PrivateLink** | Azure Private Link | Private Service Connect |
| Private path to storage | S3 gateway endpoint | **Gateway endpoint** | Private endpoint to the storage account | Private Google Access |
| Firewall rules | Security groups (443, 6666, 8443-8451) | **Security groups** | Network security groups | VPC firewall rules |
| Who talked to whom | VPC flow logs | **VPC flow logs** | VNet flow logs | VPC Flow Logs |
| Perimeter against data theft | None needed (no egress path exists) | — | — | VPC Service Controls |

## Audit and alerts

> **TL;DR:** record every API call, alarm on the dangerous ones, email the owner.

| Component | Ours | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| API audit trail | CloudTrail → audit bucket + CloudWatch Logs | **CloudTrail** | Activity log → Log Analytics | Cloud Audit Logs |
| Alarm on a log pattern | CloudWatch metric filter + alarm | **CloudWatch** | Azure Monitor log alert | Log-based metric + Cloud Monitoring alert |
| Alert delivery | SNS email | **SNS** | Action group | Notification channel |
| Agent runtime logs | Cloud Logging | CloudWatch Logs | Application Insights | **Cloud Logging** |

## Data platform

> **TL;DR:** Databricks does all of this in one product; each cloud splits it over several services.

| Component | Ours (Databricks on AWS) | AWS, no Databricks | Azure, no Databricks | Google Cloud, no Databricks |
|---|---|---|---|---|
| The platform itself | Databricks classic workspace in our VPC | **Databricks on AWS** | Azure Databricks (a first-party Microsoft service) or Microsoft Fabric | Databricks on Google Cloud, or BigQuery |
| Object storage | S3 bucket `dbx-uc` | **S3** | ADLS Gen2 / OneLake | Cloud Storage |
| Table format | Delta Lake | Apache Iceberg (S3 Tables) | Delta (OneLake) | Iceberg (BigLake tables) |
| Catalog, grants, lineage | Unity Catalog | Lake Formation + Glue Data Catalog, SageMaker Catalog | Microsoft Purview + OneLake catalog | Dataplex Universal Catalog + BigQuery IAM |
| Incremental file ingest | Auto Loader from a Unity Catalog volume | Glue job with bookmarks | Data Factory copy job | Dataflow, or BigQuery Data Transfer Service |
| Spark jobs (Bronze → Silver → Gold) | Databricks jobs on classic clusters | Glue or EMR Serverless | Fabric Spark | Google Cloud Serverless for Apache Spark, or BigQuery SQL |
| Orchestration | One Databricks orchestrator job | Step Functions or MWAA (Airflow) | Data Factory / Fabric pipelines | Cloud Composer (Airflow) or Workflows |
| Deploying the jobs | Asset Bundles from GitHub Actions | CDK or CloudFormation | Fabric deployment pipelines | Dataform or Composer DAG deploy |
| SQL engine (agent, BI) | SQL warehouse | Redshift Serverless or Athena | Fabric Warehouse | BigQuery |
| Quality gates | Our checks → `ops.dq_results`, Gold certification | Glue Data Quality | Purview data quality | Dataplex data quality scans |
| Separate machine identities (platform, deployer, runner) | Databricks service principals | IAM roles | Managed identities | Service accounts |
| Sharing with partners (not built) | Delta Sharing, Clean Rooms | Lake Formation cross-account, AWS Clean Rooms | Fabric external data sharing, Azure Confidential Clean Rooms | BigQuery sharing (ex Analytics Hub), BigQuery data clean rooms |

## ML

> **TL;DR:** plain scikit-learn runs anywhere; only tracking, registry and monitoring change.

| Component | Ours | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| Training code | scikit-learn (Isolation Forest, gradient boosting) on a job cluster | Same code on SageMaker AI jobs | Azure Machine Learning jobs | Vertex AI custom training |
| Experiment tracking | MLflow (managed by Databricks) | SageMaker AI managed MLflow | Azure Machine Learning (MLflow-compatible) | Vertex AI Experiments |
| Model registry | Unity Catalog, `finance.ml` | SageMaker Model Registry | Azure Machine Learning registry | Vertex AI Model Registry |
| Scheduled scoring | ML task in the orchestrator job | SageMaker Pipelines, batch transform | Azure ML batch endpoints | Vertex AI Pipelines, batch prediction |
| Input drift (PSI) | Our job → `ops.model_drift` | SageMaker Model Monitor | Azure ML model monitoring | Vertex AI Model Monitoring |
| Managed forecasting | Not used: a seasonal baseline wins ([story 5.2](../stories/5.2-revenue-forecast.md)) | SageMaker Canvas (Amazon Forecast is closed to new customers) | Azure ML AutoML forecasting | BigQuery ML (ARIMA_PLUS, TimesFM) |

## Agent

> **TL;DR:** runtime and model are configuration; the guardrails live in grants, the gateway and the functions.

| Component | Ours | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| Agent runtime | Vertex AI Agent Engine, scale to zero; *designed:* AgentCore Runtime in our VPC | Bedrock AgentCore Runtime | Foundry Agent Service | **Vertex AI Agent Engine** |
| Agent framework | Deep Agents (LangGraph) in a container | Same container; AWS's own: Strands Agents | Same container; Microsoft's own: Microsoft Agent Framework | Same container; Google's own: Agent Development Kit (ADK) |
| Model, EU only | Gemini 3.8 Flash, Vertex EU endpoint; *designed:* Claude on Bedrock, EU profile | Bedrock (Claude, EU inference profile) | Foundry Models (OpenAI, Claude) | **Vertex AI** (Gemini, Claude) |
| Data tools over MCP | Databricks managed MCP → 7 functions in `finance.agent` | AgentCore Gateway in front of Lambda or Redshift | Azure MCP Server, Fabric data agent | MCP Toolbox for Databases, BigQuery MCP server |
| Read-only functions that run with the owner's rights | Unity Catalog SQL functions (agent has EXECUTE only) | Redshift stored procedures, `SECURITY DEFINER` | Stored procedures `EXECUTE AS OWNER` | BigQuery authorized routines |
| Gateway for actions | AgentCore Gateway (MCP, IAM auth) | **AgentCore Gateway** | API Management (AI gateway, MCP) | Apigee |
| Figure and approval checks | Lambda `finance-close-notifier` | **Lambda** | Azure Functions | Cloud Run functions |
| Email | SES | **SES** | Azure Communication Services Email | No first-party service: SendGrid or Mailgun (Marketplace), or the Gmail API |
| Google → AWS sign-in, no key | Google ID token → STS `AssumeRoleWithWebIdentity` | **STS** | Entra workload identity federation | Workload Identity Federation (inbound to Google) |
| Approval record | Row in `finance.agent.approvals`, writable by `finance-controllers` only | Table + IAM | Table + Entra group | Table + IAM group |

## Delivery and BI

> **TL;DR:** GitHub stays wherever the cloud goes.

| Component | Ours | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| Code and CI/CD | GitHub + Actions | CodePipeline + CodeBuild | Azure DevOps (or GitHub) | Cloud Build |
| Infrastructure scan | Checkov in CI | Same | Same; Defender for Cloud DevOps security | Same |
| Docs web app | GitHub Pages | Amplify Hosting | Static Web Apps | Firebase Hosting |
| BI (not built) | Power BI on Databricks SQL | Amazon QuickSight (in Quick Suite) | Power BI | Looker |

## Target components (not built)

> **TL;DR:** the [reference architecture](../target/reference-architecture.md) adds streaming, knowledge and an AI gateway.

| Component | Target pick | AWS | Azure | Google Cloud |
|---|---|---|---|---|
| Event backbone | Kafka (MSK or Confluent) or SAP Event Mesh | Amazon MSK, Kinesis | Event Hubs (Kafka API) | Managed Service for Apache Kafka, Pub/Sub |
| Stream processing | Flink or Spark Structured Streaming | Managed Service for Apache Flink | Stream Analytics, Fabric Real-Time Intelligence | Dataflow |
| Change data capture from SAP | SAP SLT, Datasphere or Debezium | AWS DMS, AppFlow | Data Factory SAP CDC connector | Datastream, Cortex Framework |
| Vector index (RAG) | Databricks Vector Search | Bedrock Knowledge Bases, S3 Vectors, OpenSearch | Azure AI Search | Vertex AI Vector Search, RAG Engine |
| Knowledge graph (GraphRAG) | Neo4j, Neptune or graph tables | Neptune Analytics | Cosmos DB (Gremlin) | Spanner Graph |
| Small model serving (SLM) | Own GPU or private endpoint | SageMaker AI endpoints, Bedrock Custom Model Import | Foundry managed compute | Vertex AI endpoints (Model Garden) |
| AI gateway | AgentCore Gateway, Apigee, Databricks AI Gateway or LiteLLM | AgentCore Gateway | API Management AI gateway | Apigee |
| Live API layer | API gateway with quotas and caching | API Gateway | API Management | Apigee or API Gateway |
| Agent tracing | Langfuse, self-hosted in the EU | AgentCore Observability | Foundry observability, Application Insights | Cloud Trace |

## What does not map one to one

> **TL;DR:** four gaps worth knowing before a move.

| Gap | Why it matters |
|---|---|
| One catalog for everything | Unity Catalog grants tables, files, models and functions in one place, with lineage. Native stacks split this over two or three services, which is why Databricks won the benchmark (87 vs 75 for AWS-native) |
| Databricks is not the same on every cloud | The Azure trial forced a NAT (hybrid workspace) and Google classic compute ran on deprecated GKE; that is why we chose AWS ([story 2.1](../stories/2.1-where-databricks-runs.md)) |
| Owner-rights functions | The agent's "EXECUTE only, never SELECT" pattern exists everywhere, under different names: definer rights, `EXECUTE AS OWNER`, authorized routines |
| Email on Google Cloud | No first-party email service; plan a third-party sender |
