# Control Matrix

## TL;DR

A control matrix is the single page that answers "what security controls does this
platform actually have, and how do you know?" Every row names a control, says whether
it is really in place, points at the code that implements it and the evidence that
proves it, and links to the threat it defends against.

Its value is in the honest rows. Anyone can list controls they intend to have. A
matrix is only useful if it also shows what is missing, what is partial, and what was
turned down on purpose.

Current position, across 79 controls: **51 implemented, 1 partial, 17 planned, 7
deliberately not implemented, 2 unavailable on the AWS Free plan, and 1 accepted
risk** — GitHub two-factor authentication, which the owner has chosen to leave off.

Updated 2026-09-21: making the infrastructure repository public moved branch
protection, administrator enforcement and secret scanning from *unavailable* to
*implemented*.

## How to read this

**Status:**

| Value | Meaning |
|---|---|
| Implemented | Built, deployed, and verified against the live account |
| Partial | Built, but with a named limitation recorded in the Gap column |
| Planned | Designed and scheduled, not yet built |
| Not implemented | Considered and deliberately turned down, with the reason recorded |
| Accepted risk | Missing, and the owner has decided to leave it so. The residual risk is stated |
| Unavailable | Blocked by the AWS Free plan |

**Evidence** distinguishes how strongly we know a control works:

| Value | Meaning |
|---|---|
| Tested | Deliberately exercised; the control was observed doing its job |
| Verified | Read back from the live AWS account, not from the Terraform source |
| Declared | Present in code and applied cleanly, but not independently read back |
| None | Nothing to show yet |

Threat IDs refer to the [threat model](threat-model.md). File paths are in the
`retail-finance-platform-infra` repository unless stated otherwise.

## Identity and access

| ID | Control | Status | Where | Evidence | Threats | Gap |
|---|---|---|---|---|---|---|
| IAM-1 | No long-lived AWS access keys for humans or CI | Implemented | Design; `github_oidc.tf` | Verified | T-01, T-04 | Break-glass user is the one exception, and it is alarmed |
| IAM-2 | Human access via browser-issued temporary credentials | Implemented | Operating practice | Verified | T-04 | Session valid until expiry; no source-address check |
| IAM-3 | CI authenticates by GitHub OIDC federation, no stored secrets | Implemented | `github_oidc.tf` | Tested | T-01 | — |
| IAM-4 | OIDC trust pinned to immutable numeric owner and repository IDs | Implemented | `github_oidc.tf` | Tested | T-01 | — |
| IAM-5 | OIDC trust restricted to the `main` branch | Implemented | `github_oidc.tf` | Tested | T-01, T-02 | Only as strong as merge access to `main`, which branch protection now governs |
| IAM-6 | Separate read-only plan role and write-capable deploy role | Implemented | `github_oidc.tf` | Tested | T-01 | — |
| IAM-7 | Deploy role scoped to named actions and resources, not administrator | Implemented | `github_oidc.tf` | Tested | T-01, T-12 | Two residual `"*"` statements where AWS supports no resource qualifier; registered as Checkov exceptions |
| IAM-8 | Deploy role cannot create compute | Implemented | `github_oidc.tf` | Verified | T-12 | Emerges from the scoping rather than from an explicit deny |
| IAM-9 | `iam:PassRole` constrained by `iam:PassedToService` | Implemented | `github_oidc.tf` | Declared | T-01 | — |
| IAM-10 | Root account not used for operations (decision D-007) | Implemented | Policy plus ROOT-usage alarm | Tested | T-06 | — |
| IAM-11 | Root MFA enabled, no root access keys | Implemented | Account setting | Verified | T-06 | — |
| IAM-12 | Account password policy: 14 characters, complexity, 90-day rotation, 24 remembered | Implemented | `main.tf` | Declared | T-01 | — |
| IAM-13 | Break-glass administrator identity with MFA | Implemented | Account; `docs/runbooks/break-glass.md` | Tested (used twice under real failure) | T-05 | Never rehearsed deliberately, only under pressure |
| IAM-14 | Databricks cross-account role gated on external ID | Planned | Blocked on the Databricks account ID | None | T-13 | Must not be built without the `sts:ExternalId` condition |
| IAM-15 | Per-workload roles for ingestion, transformation, ML and agents | Planned | — | None | — | — |
| IAM-16 | Federated human roles (auditor, data engineer, analyst) via IAM Identity Center | Not implemented | — | None | — | Single operator; would be theatre at this scale. Revisit on a second human |

## Change control and supply chain

| ID | Control | Status | Where | Evidence | Threats | Gap |
|---|---|---|---|---|---|---|
| CHG-1 | All infrastructure defined as code | Implemented | `bootstrap/*.tf` | Verified | T-02 | — |
| CHG-2 | No production-style change without a reviewed plan | Implemented | `deploy-bootstrap.yml` applies a saved plan file | Tested | T-02 | The plan is reviewed by the same person who wrote it |
| CHG-3 | Manual gate on the deploy workflow | Partial | `deploy-bootstrap.yml` | Tested | T-02 | The typed `apply` input is a typo guard, not authorisation |
| CHG-4 | Branch protection on `main`: pull request required, status checks must pass, linear history, no force push, no deletion | Implemented | GitHub branch protection | Verified | T-02 | Required approvals are zero; one maintainer cannot approve their own pull request |
| CHG-5 | Branch protection applies to administrators | Implemented | `enforce_admins: true` | Verified | T-02 | Removable by the administrator in two clicks, so it guards against error rather than intent |
| CHG-6 | GitHub two-factor authentication | **Accepted risk** | Account setting | Verified as off | T-01 | **Finding F-1**, accepted by the owner 2026-09-21 and deliberately left open. Highest-severity item in the threat model |
| CHG-7 | All GitHub Actions pinned to full commit SHAs | Implemented | `.github/workflows/*.yml` | Verified | T-03 | Transitive dependencies of pinned actions are not pinned |
| CHG-8 | Least-privilege `permissions:` per workflow job | Implemented | `.github/workflows/*.yml` | Verified | T-03 | `release` job holds `contents: write` over a large npm tree |
| CHG-9 | Terraform and provider versions pinned, with a lock file | Implemented | `versions.tf`, `.terraform.lock.hcl` | Verified | T-03 | — |
| CHG-10 | Policy-as-code scanning on every build (Checkov) | Implemented | `ci.yml` | Tested — 200 passed, 0 failed, 24 skipped | T-03, T-09 | Advisory only; `continue-on-error` means a new finding cannot block a merge |
| CHG-11 | Every scanner exception recorded with a revisit trigger | Implemented | `docs/security/checkov-exceptions.md` | Verified | — | — |
| CHG-12 | Automated dependency updates and security alerts | Implemented | Dependabot; `vulnerability-alerts` and `automated-security-fixes` enabled | Verified | T-03 | — |
| CHG-13 | Automated secret scanning and push protection | Implemented | GitHub repository settings | Verified | T-10 | Became free when the repository was made public |
| CHG-14 | State locking to prevent concurrent applies | Implemented | S3 `use_lockfile=true` | Tested | T-11 | — |
| CHG-15 | `prevent_destroy` on irreplaceable buckets | Implemented | `main.tf`, `databricks_storage.tf` | Declared | T-07 | Removable by anyone who can edit the code |
| CHG-16 | Documented emergency recovery path | Implemented | `docs/runbooks/break-glass.md` | Tested twice | T-01 | — |

## Audit and detection

| ID | Control | Status | Where | Evidence | Threats | Gap |
|---|---|---|---|---|---|---|
| AUD-1 | Multi-region CloudTrail management-event trail | Implemented | `audit.tf` | Verified | T-07, T-08 | — |
| AUD-2 | Global service events included | Implemented | `audit.tf` | Verified | T-06 | — |
| AUD-3 | Log file validation enabled | Implemented | `audit.tf` | Verified | T-07 | Detects tampering; does not prevent it |
| AUD-4 | Object-level data events on the Terraform state bucket | Implemented | `audit.tf` | Verified | T-10 | Only this bucket; data buckets are not covered |
| AUD-5 | Audit log bucket protected: versioned, encrypted, TLS-only, no public access | Implemented | `audit.tf` | Verified | T-07 | No Object Lock, so a sufficiently privileged identity can still delete |
| AUD-6 | Trail streams to CloudWatch Logs for near real-time matching | Implemented | `alerting.tf` | Tested | T-05, T-06 | — |
| AUD-7 | Alarm on break-glass administrator writes | Implemented | `alerting.tf` | Tested — drove a real alarm within minutes | T-05 | — |
| AUD-8 | Alarm on root account use | Implemented | `alerting.tf` | Tested | T-06 | — |
| AUD-9 | Alarms deliver to a confirmed email subscription | Implemented | `alerting.tf` | Tested | T-05, T-06 | One inbox, one channel, no on-call |
| AUD-10 | Alarm on trail tampering (`StopLogging`, `DeleteTrail`, `UpdateTrail`, `PutEventSelectors`) | Planned | — | None | T-07 | **Finding F-3.** Reuses existing log group and topic; marginal cost near zero |
| AUD-11 | Alarm on IAM policy and role changes | Planned | — | None | T-08 | **Finding F-3.** Same |
| AUD-12 | Log retention: 365 days in S3, 90 days in CloudWatch Logs | Implemented | `audit.tf`, `alerting.tf` | Declared | T-07 | Deliberate asymmetry: S3 is the system of record, CloudWatch is the trigger |
| AUD-13 | Logs stored in a separate account from the workloads | Not implemented | — | None | T-07 | Requires AWS Organizations, which would forfeit the Free plan credit |
| AUD-14 | S3 server access logging on buckets | Not implemented | — | None | T-10 | CloudTrail data events are the better control and are in place for state. Registered as a Checkov exception |
| AUD-15 | AWS Config configuration recorder | Not implemented | — | None | — | Usage-priced per configuration item; unbounded against a USD 50 ceiling |
| AUD-16 | GuardDuty threat detection | Unavailable | — | None | T-04, T-12 | Not offered on the Free plan |
| AUD-17 | Security Hub posture management | Unavailable | — | None | — | Not offered on the Free plan |

## Data protection

| ID | Control | Status | Where | Evidence | Threats | Gap |
|---|---|---|---|---|---|---|
| DAT-1 | Encryption at rest on every bucket (SSE-S3, AES-256) | Implemented | all four buckets | Verified | T-10 | S3-managed keys, so no key-level revocation or independent decryption audit |
| DAT-2 | TLS required in transit, enforced by bucket policy | Implemented | all four buckets | Verified | T-09, T-10 | — |
| DAT-3 | Block Public Access on all four settings, per bucket | Implemented | all four buckets | Verified | T-09 | — |
| DAT-4 | Block Public Access at account level | Planned | — | None | T-09 | **Finding F-4.** A bucket created outside Terraform inherits no guard |
| DAT-5 | Bucket-owner-enforced ownership, disabling ACLs | Implemented | all four buckets | Verified | T-09 | — |
| DAT-6 | Versioning, so a bad overwrite is recoverable | Implemented | all four buckets | Verified | T-07, T-11 | — |
| DAT-7 | Lifecycle rules reaping superseded versions and abandoned uploads | Implemented | `main.tf`, `audit.tf`, `databricks_storage.tf` | Declared | T-12 | — |
| DAT-8 | No credentials or state in Git | Implemented | `.gitignore`; backend in S3; secret push protection | Verified — full history scanned 2026-09-21 before publication | T-10 | A stale local state file remains on the workstation. The AWS account identifier is now public by decision, though it is not a credential |
| DAT-9 | Customer-managed KMS keys | Not implemented | — | None | T-10 | Fixed monthly charge per key against a USD 50 ceiling. Registered as a Checkov exception with a revisit trigger |
| DAT-10 | Cross-region replication of state | Not implemented | — | None | — | Contradicts decision D-013 and doubles cost to protect a reproducible file |
| DAT-11 | Data classification tags (`public`, `internal`, `confidential`, `restricted`) | Planned | — | None | T-14 | Needed before data lands |
| DAT-12 | Technical control preventing real PII entering the platform | Planned | — | None | T-14 | Currently policy only |

## Network

| ID | Control | Status | Where | Evidence | Threats | Gap |
|---|---|---|---|---|---|---|
| NET-1 | Default VPC not used for platform workloads | Implemented | No workloads deployed | Verified | — | Trivially true today; must survive first deployment |
| NET-2 | No NAT Gateway (hourly cost even when idle) | Implemented | Design decision | Verified | T-12 | — |
| NET-3 | Dedicated VPC with restricted egress | Planned | Depends on the Databricks deployment model chosen | None | — | Serverless may remove the need entirely |

## Cost and availability

| ID | Control | Status | Where | Evidence | Threats | Gap |
|---|---|---|---|---|---|---|
| CST-1 | Monthly AWS budget of USD 50 | Implemented | `main.tf` | Verified | T-12 | — |
| CST-2 | Alerts at 50% and 80% actual, 100% forecast | Implemented | `main.tf` | Verified | T-12 | Lags real spend by hours |
| CST-3 | Budget measures gross spend, ignoring credits | Implemented | `main.tf` (`include_credit = false`) | Declared | T-12 | Deliberate: promotional credit must not hide burn |
| CST-4 | No hourly-billed resources deployed | Implemented | Whole estate | Verified | T-12 | — |
| CST-5 | AWS Organizations and Control Tower not activated | Implemented | Decision D-009 | Verified | — | Deliberate, to preserve the Free plan credit |
| CST-6 | Databricks spend monitoring | Planned | — | None | T-12 | **The AWS budget cannot see Databricks charges.** DBUs are billed by Databricks and need separate watching |
| CST-7 | Cluster auto-termination and cost guardrails | Planned | `docs/architecture/frankfurt-foundation.md` | None | T-12 | Agreed in design; enforceable only once a workspace exists |
| CST-8 | A hard spending stop, as opposed to an alert | Not implemented | — | None | T-12 | AWS offers no true hard stop. The practical substitute is deleting resources, which the runbook covers |

## Governance of data, models and agents

All planned. Recorded now so they are designed in rather than retrofitted.

| ID | Control | Status | Threats |
|---|---|---|---|
| GOV-1 | Unity Catalog as the single governance layer for catalogs, schemas, tables, lineage and grants | Planned | T-14 |
| GOV-2 | Data contracts and quality gates between ingestion and consumption | Planned | T-15 |
| GOV-3 | Model registry with versioning and approval before deployment | Planned | T-15 |
| GOV-4 | Agent tools read-only and individually authorised | Planned | T-16 |
| GOV-5 | Agent outputs carry source citations and deterministic metrics | Planned | T-15 |
| GOV-6 | Evaluation suite and human review before any agent output is trusted | Planned | T-15 |
| GOV-7 | All ingested content treated as untrusted model input | Planned | T-16 |

## Summary

| Status | Count |
|---|---|
| Implemented | 51 |
| Partial | 1 |
| Planned | 17 |
| Not implemented, deliberately | 7 |
| Unavailable on the AWS Free plan | 2 |
| Accepted risk | 1 |
| **Total** | **79** |

The highest-value remaining moves are AUD-10 and AUD-11, which alarm on tampering
with the controls themselves, and DAT-4, the account-level public access block. Both
are small and nearly free.

CHG-6 sits above all of them on severity and remains open by owner decision. It is
the one row on this page where the honest status is "we know, and we chose not to."
That is a legitimate answer for a portfolio account holding synthetic data, and it
stops being legitimate the moment real data or a second user arrives.

## Related

- [Threat model](threat-model.md) — what these controls defend against
- [Responsibility matrix](responsibility-matrix.md) — who owns each one
