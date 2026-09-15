# Retail Finance Data, ML and Agentic AI Platform

## Purpose

Build a portfolio-grade, enterprise-style platform on AWS and Databricks for a
retail finance department. The project must demonstrate cloud foundations, data
engineering, analytics, machine learning, agentic AI, security, governance,
compliance, operations and CI/CD.

This file is the tool- and agent-agnostic source of truth. A human, coding agent,
IDE assistant or CI job should be able to understand the project's intent,
constraints, current state and next action from this document.

## Plain-language summary

We are building the controlled cloud environment first. The data and AI platform
will only be placed on top after identity, account boundaries, logging, security
and cost controls have been designed. The final product will help a fictional
retail finance team explain revenue and margin, forecast results, detect unusual
activity and prepare evidence-backed management narratives.

## Business scenario

The fictional company is a multi-channel retailer. Its finance department needs:

- revenue, refund, cost and gross-margin reporting;
- actual-versus-budget variance analysis;
- store, channel, category and product profitability;
- cash-flow and demand forecasting;
- reconciliation and finance data-quality controls;
- anomaly detection for payments, refunds and margin leakage;
- governed, traceable natural-language analysis of approved results.

The agentic layer may investigate, summarize and recommend. It must not post
journal entries, move money, approve payments or take other consequential finance
actions without explicit human approval.

## Framework map

- AWS Cloud Adoption Framework (CAF): defines the business, people, governance,
  platform, security and operations capabilities the organization needs.
- AWS Control Tower: AWS-managed service used to establish and govern a
  multi-account landing zone.
- AWS Well-Architected Framework (WAF): review method covering operational
  excellence, security, reliability, performance efficiency, cost optimization
  and sustainability.
- Terraform: infrastructure-as-code mechanism for reproducible platform resources
  and approved extensions around Control Tower-managed resources.
- Databricks: governed lakehouse, data engineering, analytics, ML and AI platform.

## Delivery principles and rules

1. Never store passwords, access keys, session tokens or private keys in Git.
2. Humans use federated short-lived access through IAM Identity Center where
   possible. CI/CD uses OIDC federation and short-lived role sessions.
3. Apply least privilege, separation of duties and deny-by-default boundaries.
4. Treat AWS accounts as primary security and blast-radius boundaries.
5. Encrypt data in transit and at rest. Centralize immutable audit evidence.
6. Classify data and enforce access using roles, groups, tags and policies.
7. Use synthetic sensitive fields; do not ingest real cardholder or personal data.
8. No production-style infrastructure change without a reviewed Terraform plan.
9. Do not manually modify resources managed by Control Tower or Terraform.
10. Tag resources for owner, environment, application, data classification and cost.
11. Define budgets before persistent or potentially expensive services are enabled.
12. Prefer private connectivity and minimize public endpoints and outbound access.
13. Test security, policy, data quality and recovery—not only application behavior.
14. Record material decisions, assumptions, evidence, risks and exceptions in Git.
15. Agents default to read-only analysis. Consequential actions require a human gate.

## Target environments

The enterprise target is a multi-account landing zone with distinct security,
shared platform and workload boundaries. The exact organization and account design
is pending discovery of the user's AWS account and budget. A lower-cost portfolio
variant may simulate some environment separation while documenting the full
production design and its trade-offs.

Candidate boundaries (not yet approved):

- Management account: organization and billing only; no workloads.
- Log Archive account: protected organization-wide audit logs.
- Audit/Security Tooling account: delegated security administration and investigation.
- Shared Services account: CI/CD and approved shared platform capabilities.
- Data/ML Development account: development workloads and Databricks development.
- Data/ML Production account: tightly controlled production workloads.

## Time and cost constraints

- Delivery window: one week for the initial end-to-end portfolio implementation.
- Current AWS account plan: user-confirmed AWS Free account plan with USD 100 credit.
- Additional personal-spend ceiling: USD 50 per month.
- Operating approach: complete the initial build in one week, then tear down or
  suspend chargeable workload resources. Persistent landing-zone services require
  a separate cost review because not every foundational service can be paused.
- Cost-critical constraint: current AWS terms state that creating or joining an
  AWS Organization, or setting up Control Tower, immediately expires Free Tier
  credits and upgrades the account to a paid plan.
- Therefore, a real Control Tower landing zone is not approved for deployment yet.
  We will first compare a fully deployable design with a low-cost single-account
  implementation and decide explicitly which evidence is worth paying for.

## Data strategy

Use openly licensed retail/economic datasets plus generated ERP-like records.
Candidate domains are orders, payments, refunds, inventory, procurement, budgets,
general-ledger entries, exchange rates, inflation, holidays and promotions. Every
source must have its license, owner, schema, refresh behavior, quality expectations
and classification documented before ingestion.

## Repository strategy

This repository is the program control plane. It owns shared context, roadmap,
cross-repository decisions, progress, and coordination; it does not own deployable
infrastructure or application code. `REPOSITORIES.md` is the canonical path and
ownership map. Infrastructure, data products, ML, and agent applications have
separate repositories and release lifecycles.

## Delivery phases

| Phase | Outcome | Status |
|---|---|---|
| 0. Discovery and guardrails | Identity, budget, region, constraints and documentation | In progress |
| 1. Landing-zone design | Account/OU model, identity, controls, logging and threat model | Not started |
| 2. Landing-zone implementation | Control Tower and governed account baseline | Not started |
| 3. Platform foundation | Terraform state, networking, KMS, CI/CD and observability | Not started |
| 4. Databricks foundation | Workspaces, Unity Catalog, storage, networking and RBAC | Not started |
| 5. Data products | Ingestion, bronze/silver/gold, quality, lineage and serving | Not started |
| 6. ML platform | Features, experiments, registry, deployment and monitoring | Not started |
| 7. Agentic platform | Governed tools, orchestration, evaluation and human approvals | Not started |
| 8. Assurance | WAF review, controls evidence, recovery tests and portfolio demo | Not started |

## Progress log

### 2026-09-14

- Confirmed AWS CLI 2.36.44 is installed in Ubuntu 22 under WSL2.
- Confirmed terminal access to WSL from the project environment.
- Inspected the workspace: it contained no tracked project files or agent-specific
  instruction files at discovery time.
- Ran read-only AWS discovery. No AWS CLI profiles or credentials were configured,
  so account identity and AWS Organizations state remain unknown.
- Created this source-of-truth document.
- Verified that `aws login` currently authenticates the CLI as the AWS account root
  user. The account identifier is intentionally not stored in this repository.
- Paused all further AWS API calls until routine access is moved to an IAM Identity
  Center administrator using temporary role credentials.
- Recorded the one-week delivery target, AWS Free account plan, USD 100 credit and
  USD 50 additional-spend ceiling.
- Clarified that the personal-spend ceiling is USD 50 per month and that chargeable
  workloads should be removed or suspended after the one-week implementation.
- Verified from current AWS documentation that Organizations or Control Tower would
  upgrade the account and immediately expire its Free Tier credits.
- Verified non-root CLI access as the named IAM user `cheikh-platform-admin`; no
  root identity is used for subsequent project operations.
- Read-only discovery found: standalone account, no Control Tower landing zone, one
  default VPC in `eu-north-1`, no EC2 instances, no S3 buckets, no CloudTrail trail,
  no AWS Config recorder, and no account password policy.
- Verified root MFA is enabled and no root access keys exist via IAM account summary.
- GuardDuty and Security Hub return subscription-required errors on the current Free
  plan; they remain documented enterprise controls rather than hidden omissions.
- Selected `eu-west-3` (Paris) as the proposed primary region because Databricks
  supports it and `eu-north-1` is not in the current Databricks supported-region list.
- Verified local tooling: Terraform 1.14.6, Git 2.34.1, Python 3.10.12, Docker 25.0.3
  and jq 1.6.
- Added the single-account architecture and one-week delivery roadmap.
- Added the first Terraform bootstrap stack for encrypted/versioned remote state,
  a USD 50 monthly budget, and the IAM account password policy. It has not been
  initialized, planned or applied yet.
- Initialized the bootstrap stack locally, selected and locked HashiCorp AWS provider
  6.64.0, and passed `terraform fmt -check` and `terraform validate`. No Terraform
  plan or apply has been run, and no AWS resources were changed.
- Reclassified this repository as the program/AI control plane and created a
  canonical repository map.
- Split Terraform and infrastructure-specific context into the sibling
  `retail-finance-platform-infra` repository.
- Verified both independent Git roots and revalidated Terraform successfully after
  the move. Updated the local AWS profile default region to `eu-west-3`; its browser
  session then required re-authentication before further AWS calls.
- Reviewed the bootstrap plan: 9 additions, 0 changes, 0 deletions. Corrected the
  budget to measure gross service cost before credits/refunds. AWS could not expose
  the standalone account's primary email through the available API, so alerts use a
  real locally configured recipient that is excluded from Git.
- Applied the bootstrap plan successfully: protected S3 state bucket, USD 50 gross-
  cost Budget, and IAM password policy; 9 resources added, none changed or destroyed.
- Documented a temporary-credential bridge for Terraform 1.14 S3 backend because it
  does not directly consume the new AWS CLI `login_session` credential source.
- Migrated bootstrap state to encrypted/versioned S3 with native lockfile support.
  Verified the USD 50 gross-cost Budget is healthy at USD 0 actual spend, verified
  the IAM password policy, and confirmed a post-apply Terraform plan has no drift.
- Enabled Budget notifications at 50% actual, 80% actual, and 100% forecasted spend;
  the update changed only the existing Budget and created or destroyed nothing.
- Changed the workload/AI region from Paris to Frankfurt after current feature
  verification. Added an infrastructure CI/CD design using semantic-release and a
  non-blocking Checkov job; no workload resources were moved because none exist yet.
- Prepared private GitHub publication under the personal GitHub account, with remote
  names `retail-finance-platform-control-plane` and
  `retail-finance-platform-infra`; performed pre-push credential and account-ID
  hygiene checks.
- Published both private repositories. Infrastructure CI passed Terraform checks and
  semantic-release created `v1.0.0`; a Checkov setup defect was diagnosed and fixed
  so the advisory scan executes rather than merely remaining non-blocking.
- Verified the repaired infrastructure workflow on GitHub: Terraform checks passed,
  Checkov executed 37 controls (32 passed, 5 findings) without blocking the workflow,
  and semantic-release created `v1.0.1`.

## Decisions

| ID | Decision | Status | Reason |
|---|---|---|---|
| D-001 | Use a retail finance department scenario | Accepted | User-selected business domain |
| D-002 | Build the governed cloud foundation before workloads | Accepted | Establish enterprise controls first |
| D-003 | Use Terraform for reproducible infrastructure | Accepted | User requirement |
| D-004 | Use AWS Databricks for the lakehouse and ML platform | Accepted | User requirement |
| D-005 | Keep project context agent-agnostic | Accepted | Supports multiple tools and human handoff |
| D-006 | Use AWS Control Tower versus a custom landing zone | Proposed | Requires account, budget and constraint discovery |
| D-007 | Prohibit root identity for project operations | Accepted | Root has unrestricted account authority and is reserved for root-only recovery/bootstrap tasks |
| D-008 | One-week initial delivery window | Accepted | User constraint; requires a thin end-to-end slice and documented future roadmap |
| D-009 | Preserve Free plan; do not deploy Organizations or Control Tower | Accepted | Retain the USD 100 credit; implement a single-account baseline and keep the multi-account landing zone deployable as a reference design |
| D-010 | Use `eu-west-3` as primary project region | Superseded | Basic Databricks support exists, but custom model/agent serving is unavailable |
| D-011 | Separate control plane, infrastructure, data, ML, and agent repositories | Accepted | Independent ownership, permissions, CI/CD, state, and release lifecycles |
| D-012 | Use `eu-central-1` for workloads/AI; retain state in `eu-west-3` | Accepted | Frankfurt supports Databricks custom model/agent serving and Bedrock Custom Model Import while remaining in the EU |

## Open decisions

- Monthly AWS and Databricks budget ceiling.
- Primary AWS region and data-residency requirements.
- Current AWS Organizations/Control Tower state.
- Real multi-account deployment versus cost-conscious simulation.
- Identity provider and IAM Identity Center configuration.
- Git host and CI/CD platform.
- Databricks account, edition, pricing and serverless availability.
- Compliance scope to simulate (for example GDPR, PCI DSS concepts, SOX controls).
- Public datasets and their licenses.

## Known risks

- Critical: the only currently verified CLI session is the AWS account root user.
  It must not be used by Terraform, CI/CD or routine discovery/deployment work.
- Creating/joining an AWS Organization or enabling Control Tower will immediately
  expire the account's Free Tier credits under current AWS terms.
- Control Tower and its integrated logging/security services create ongoing cost.
- Databricks compute and network egress can exceed a portfolio budget without limits.
- A personal AWS account may not yet have the additional email addresses/accounts
  needed for a representative multi-account landing zone.
- Terraform must not conflict with Control Tower-owned resource lifecycles.
- Finance agents can produce plausible but incorrect narratives; outputs therefore
  need source citations, deterministic metrics, evaluation and human review.

## Current verified state

- Local workspace: `C:\Users\cheik\.vscode\dataMLPlatform`
- WSL workspace: `/mnt/c/Users/cheik/.vscode/dataMLPlatform`
- AWS CLI: installed and runnable in WSL
- AWS authentication: named IAM user using browser-based temporary CLI credentials
- AWS account identity: account verified; identifier intentionally omitted from Git
- AWS Organization: none; standalone account verified
- AWS Control Tower: no landing zone
- Existing regional resources observed in `eu-north-1`: default VPC only; no EC2
  instances or S3 buckets
- Security baseline: root MFA enabled; no root access keys; no CloudTrail, Config
  recorder or account password policy; GuardDuty/Security Hub unavailable on Free plan
- AWS resources created by this project: none
- Delivery target: one week for the initial implementation
- Budget: USD 100 AWS credit plus up to USD 50 personal spend per month; enabling
  Organizations or Control Tower would forfeit the AWS credit under current terms

## Immediate next actions

1. Secure the root user with MFA and end its CLI session.
2. Establish a named IAM administrator with MFA and AWS CLI browser login using
   temporary credentials; do not create long-lived access keys.
3. Keep Organizations and Control Tower undeployed while the Free plan is active.
4. Run read-only account, Control Tower, region, billing and quota discovery.
5. Create a one-week delivery plan and service-level cost estimate.
6. Produce the landing-zone architecture, threat model and responsibility matrix.
7. Review the plan before creating or enrolling any AWS accounts.

## Working convention

At the end of every meaningful work session, update the phase table, progress log,
decisions, risks, verified state and next actions. Statements must distinguish
verified facts from proposals. Technical explanations should include a plain-word
interpretation so the project remains understandable to a human reviewer.
