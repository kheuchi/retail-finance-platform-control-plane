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

## Human communication contract

Every assistant status update and handoff must:

1. Start with a short `TL;DR` in plain words.
2. Explain technical terms when first used, including what they mean operationally.
3. Separate verified facts, proposals, assumptions, risks and remaining work.
4. State resource changes and cost impact plainly, especially creates and destroys.
5. Avoid assuming the reader already knows AWS, Terraform, Databricks or ML jargon.
6. Keep explanations concise enough for interview preparation while preserving the
   technical vocabulary a practitioner is expected to use.

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
- Standardized all regional project infrastructure on `eu-central-1`. Migrated the
  protected/versioned Terraform state backend from Paris to Frankfurt, verified a
  zero-drift refresh plan, and then permanently retired the old Paris bucket.
- Added passwordless GitHub-to-AWS CI/CD using OIDC: a `main`-only read/plan role and
  a separately scoped deployment role trusted only by the `aws-bootstrap`
  Environment. Applies require manual dispatch and an exact saved Terraform plan.
- Recorded a GitHub-plan constraint: private repositories on the current GitHub
  plan cannot enable Environment reviewer protection, so manual dispatch is the
  portfolio human gate and required reviewers remain the enterprise target.
- Began the live GitHub OIDC proof. The first role assumption failed safely because
  GitHub uses a hardened OIDC subject containing immutable owner/repository numeric
  IDs rather than the legacy name-only subject. Captured only non-sensitive claims,
  corrected the trust policy locally, and removed the diagnostic step. The corrected
  policy still requires plan/apply verification before this item is complete.

### 2026-09-15

- Completed the GitHub OIDC proof. Passwordless GitHub-to-AWS authentication is now
  verified end to end: Actions assumes the read-only plan role, reads the Frankfurt
  remote state, and reports a zero-drift Terraform plan. Infrastructure release
  `v1.1.0` was cut automatically.
- Before applying, recovered the real OIDC `sub` claim from the retained CI log of
  the earlier failed run and independently confirmed the numeric owner and repository
  IDs through the GitHub API, rather than trusting the prepared fix unverified.
- The trust-policy apply changed 2 resources in place and added or destroyed none.
  No chargeable resources were created and no credentials were stored.
- Fixing the first fault revealed a second one it had been masking: the CI
  Budget-email secret did not reach Terraform as a usable value. Re-set it from the
  Git-ignored local variables file without exposing the address, and rewrote the
  validation message so the failure explains itself instead of recurring silently.
- Recorded the verified WSL2 toolchain in the infrastructure repository. Nothing
  required installation; AWS CLI 2.36.44, Terraform 1.14.6, GitHub CLI, jq and
  python3 were already present and working.
- Confirmed the deploy role has still never been exercised by a real apply. Only the
  plan path is proven against AWS.

### 2026-09-16

- Removed all employer email addresses from both repositories' Git history. Every
  commit in both repos, and the three infrastructure release tags, now use a single
  personal identity. Dependabot's own authorship was left intact.
- Identified the underlying cause: Windows Git and WSL Git carried different global
  `user.email` values, so the shell that happened to run the commit decided the
  author. Both global configurations and both repository-local configurations are
  now aligned, so the mismatch cannot recur.
- Changed the AWS Budget alert recipient to a personal address, updating both the
  Git-ignored Terraform variables file and the GitHub Actions secret. No address is
  stored in Git.
- Delivered the Budget change through the deployment pipeline rather than the
  workstation, which gave the deploy role its first real exercise. The first attempt
  failed safely during the plan phase and exposed a genuine defect: the deploy role
  could modify the state bucket and the Budget but lacked permission to finish
  reading them, and Terraform refreshes before it plans. Corrected the policy,
  reran, and the pipeline planned and applied successfully.
- Verified against AWS afterwards: all three Budget alerts intact, the subscriber is
  the new personal address, USD 50 ceiling against USD 0.001 observed spend, and a
  refresh plan reports no drift.
- Recorded a design gap. The deploy role could not repair its own permissions,
  because the missing permissions were what blocked its plan, so recovery required a
  human administrator session. A tested human break-glass path must therefore remain
  available alongside the automation; the infrastructure repository documents the
  current path and the enterprise target.

- Triaged the policy scan to zero unexplained findings: 90 passed, 0 failed, 6
  deliberate skips. Two were real defects and were fixed, including an over-granted
  IAM permission that used a wildcard where AWS supports resource-level scoping. The
  other five are recorded as justified exceptions, each with its residual risk and
  the trigger that would make us revisit it.
- Re-ran the deployment pipeline after narrowing that permission, to confirm the
  tightened role still works. Narrowing a permission without retesting the path that
  uses it would only have been a guess.
- Wrote a break-glass runbook from the failure that produced it, stating the current
  weaknesses plainly rather than implying maturity the setup does not have.
- Designed and costed the Frankfurt network, audit and Databricks foundations. The
  finding worth carrying: cost is concentrated in two specific choices, not spread
  across the platform. A NAT Gateway is roughly USD 37 per month before any data
  moves, and Databricks compute left running is the likeliest way to breach the
  ceiling. Everything else in that layer is close to free, so the design stays
  serverless-first and needs no VPC at all unless classic compute forces it.

- Built the audit baseline, the first piece of the Frankfurt foundation. The account
  now records who called which AWS API, when and from where; previously nothing
  recorded that at all. A protected log bucket plus a multi-region CloudTrail with
  global service events and log file validation, with object-level events captured
  for the Terraform state bucket only. Verified live: logging enabled, delivery
  succeeding, no drift. Cost is pennies and no hourly resources were created.
- The apply was deliberately split in two, granting the deploy role its permissions
  before creating the resources, because a role cannot create what it has no
  permission for. That was still not sufficient: two CloudTrail actions are
  account-wide enumeration calls that AWS does not allow to be resource-scoped, so
  the post-create read-back failed. The resources applied correctly and the trail
  logged throughout, but the pipeline could no longer refresh.
- Recovered through the break-glass runbook, which has now had two real uses in one
  day. The lesson is recorded: least-privilege scoping has to be checked against
  whether each individual action supports resource-level permissions at all, because
  several do not and the failure only appears at runtime.

### 2026-09-17

- Built the alerting layer on top of the audit trail, so security-relevant activity
  is noticed rather than merely recorded. CloudTrail now also streams to CloudWatch
  Logs, where metric filters match events as they arrive and alarms publish to an
  email topic.
- Two detections: any write performed by the break-glass administrator identity,
  since routine change is expected through CI rather than from a workstation; and any
  use of the root account, which decision D-007 forbids.
- Verified by testing rather than assumption. A deliberate write as the administrator
  identity produced matching events and drove the alarm into ALARM within a few
  minutes. Two lessons recorded: one plausible-looking spelling of the filter
  condition parses and deploys but silently never fires, and Terraform state-lock
  writes are attributed to whichever identity ran the command.
- This closes the alerting gap the break-glass runbook had named as a known weakness,
  and the runbook was updated rather than left with a stale claim.
- The whole increment deployed through the pipeline in one clean run: permissions
  first, then resources, 10 added and 1 changed, with no permission failure and no
  break-glass recovery. The two-phase pattern adopted after the earlier failures
  worked as intended.
- Cost: CloudWatch Logs ingestion and storage bounded by a 90-day retention that is
  deliberately shorter than the 365 days kept in S3, which remains the durable
  record. Alarms are within the free allowance. Nothing hourly was created.

- Confirmed the security-alerts email subscription, so the alarms now reach a real
  inbox. The confirmation had gone to spam, and it had been sent to the alerts
  address rather than the address registered on the AWS account, which are different
  mailboxes.
- Built the Databricks storage prerequisites: workspace root storage and the Unity
  Catalog managed location, both carrying the estate's standard protections and both
  verified against AWS. Empty buckets cost nothing and both sit on the critical path
  to a workspace.
- Deliberately stopped short of the Databricks IAM. The cross-account role, the Unity
  Catalog storage credential role and the Databricks statements on the bucket
  policies are all conditioned on the Databricks account ID, which does not exist
  until the account is created. Writing them now would mean shipping IAM that can be
  neither applied nor tested.
- Confirmed against the official documentation that the AWS promotional credit does
  not cover Databricks charges and that Databricks Free Edition cannot use our own S3
  buckets. The 14-day trial with USD 400 of Databricks credit is therefore the only
  viable route for this project, and its clock starts at sign-up.

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
| D-012 | Use `eu-central-1` for workloads/AI; retain state in `eu-west-3` | Superseded | The split was safe but added needless complexity at this early project stage |
| D-013 | Standardize all regional resources on `eu-central-1` | Accepted | Simpler governance and operations; required Databricks and Bedrock model capabilities remain available |

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
- AWS resources created by this project: protected/versioned Terraform state in
  `eu-central-1`, a USD 50 monthly Budget with alerts, an IAM password policy, a
  GitHub OIDC identity provider, separate CI plan and deploy roles, and the audit
  baseline (a protected CloudTrail log bucket and a multi-region management-events
  trail). None are hourly-billed.
- Audit and alerting: verified. A multi-region trail with global service events and
  log file validation is logging to a protected bucket, with object-level events on
  the Terraform state bucket. The trail also streams to CloudWatch Logs, where tested
  metric filters alarm on break-glass administrator writes and on root account use.
  The email subscription for those alarms is still pending confirmation. The single-account limitation is documented: logs sit
  beside the workloads they describe, which only a Log Archive account fixes.
- CI/CD authentication: verified end to end. GitHub Actions reaches AWS through
  short-lived OIDC sessions with no stored access keys. Both paths are proven: the
  plan path returns zero drift, and the deploy role has planned and applied a real
  change through the manually gated workflow.
- Databricks: storage prerequisites built and verified in `eu-central-1`. The
  cross-account and Unity Catalog roles remain outstanding, blocked on the Databricks
  account ID. No Databricks account exists yet and no Databricks charges have been
  incurred.
- Local toolchain: WSL2 Ubuntu with AWS CLI 2.36.44, Terraform 1.14.6, GitHub CLI,
  jq and python3, all verified present on 2026-09-15 with no installation required.
  Versions and the two environment caveats are recorded in the infra repository's
  `PROJECT_CONTEXT.md`.
- Delivery target: one week for the initial implementation
- Budget: USD 100 AWS credit plus up to USD 50 personal spend per month; enabling
  Organizations or Control Tower would forfeit the AWS credit under current terms

## Immediate next actions

1. Keep Organizations and Control Tower undeployed while the Free plan is active.
2. Decide when to start the Databricks trial, then supply the Databricks account ID.
   The remaining IAM and the workspace can then be built and tested in one pass.
   Start it only when there is a clear run at the build, since the 14-day clock
   begins at sign-up and the AWS credit does not cover Databricks charges.
4. Produce the threat model, control matrix and responsibility matrix.
5. Rehearse the break-glass path deliberately, rather than only ever having executed
   it under failure.

## Working convention

At the end of every meaningful work session, update the phase table, progress log,
decisions, risks, verified state and next actions. Statements must distinguish
verified facts from proposals. Technical explanations should include a plain-word
interpretation so the project remains understandable to a human reviewer.
