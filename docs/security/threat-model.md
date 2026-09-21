# Threat Model

## TL;DR

A threat model is a written answer to four questions: what are we protecting, who
would attack it, how would they get in, and what stops them. It is done on paper,
before an incident, because the cheapest time to find a gap is before someone else
does.

This exercise found that the platform's strongest controls are in AWS, and its
weakest link is outside AWS entirely. The AWS side is in reasonable shape for a
single account: short-lived credentials everywhere, no stored access keys, a scoped
deploy role, an audit trail, and two tested alarms.

The path into that account, however, runs through a GitHub account that has
two-factor authentication switched off, and a `main` branch that anyone with push
access can write to directly. Both were verified, not assumed. A password is
currently the only thing standing between an attacker and a role that can change
IAM, S3 and the audit trail.

Four gaps were found. The two most serious are free to fix and should be fixed
first. Details in **Findings** below.

## Scope and method

In scope: everything built so far in the project AWS account in `eu-central-1`, the
two Git repositories, and the CI/CD path between them. Databricks and the data, ML
and agent layers appear as planned components, marked as such.

Out of scope: physical security of AWS data centres, and anything AWS is
contractually responsible for under the shared responsibility model. Those are
covered in the [responsibility matrix](responsibility-matrix.md).

Method: asset-centric, walking each trust boundary in turn. Each threat is tagged
with a STRIDE category, the standard six-way split of what can go wrong:

- **S**poofing — pretending to be someone else
- **T**ampering — changing data or code without authority
- **R**epudiation — acting without leaving usable evidence
- **I**nformation disclosure — reading what you should not
- **D**enial of service — making the system unavailable, including by exhausting
  the budget
- **E**levation of privilege — gaining more authority than was granted

Severity is likelihood times impact, judged for this system as it actually is, not
for the enterprise deployment it is modelled on.

## What we are protecting

| ID | Asset | Why it matters |
|---|---|---|
| A-1 | The AWS account itself | Whoever controls it controls everything below |
| A-2 | Terraform state | Describes the whole estate and can contain sensitive values in clear text |
| A-3 | The audit trail | The only record of who did what; worthless if it can be altered |
| A-4 | The GitHub repositories | Code here becomes infrastructure there; this is the supply chain |
| A-5 | The Databricks storage buckets | Will hold finance data once the lakehouse exists |
| A-6 | The budget and the AWS credit | Exhaust it and the project stops; this is availability, not merely cost |
| A-7 | Finance data products and model outputs | Planned; the reason the platform exists |

## Trust boundaries

A trust boundary is a line where something less trusted hands work to something more
trusted. Each line is a place where credentials must be checked.

```text
        +--------------+
        |   Internet   |
        +------+-------+
               |  (B3) blocked: public access block, TLS-only
               v
  +-----------------------------------------------------+
  |  Project AWS account  .  eu-central-1                |
  |                                                      |
  |   S3 state . S3 audit . S3 dbx-root . S3 dbx-uc      |
  |   CloudTrail -> CloudWatch Logs -> alarms -> SNS     |
  |   IAM roles . Budget . password policy               |
  +--^--------------^---------------^--------------^-----+
     |              |               |              |
   (B1)           (B2)            (B4)           (B5)
  GitHub        workstation     break-glass    Databricks
  Actions       federated       IAM user       control plane
  via OIDC      session         (emergency)    (planned)
     |              |               |              |
  no stored      short-lived     password +     cross-account
  secrets        credentials     MFA, alarmed   role + external ID
```

| ID | Boundary | How trust is established today |
|---|---|---|
| B1 | GitHub Actions to AWS | OIDC federation; the trust policy pins owner and repository by immutable numeric ID and the `main` branch |
| B2 | Workstation to AWS | Browser-based login issuing temporary credentials; no access keys on disk |
| B3 | Internet to S3 | Denied: public access block on every bucket, bucket-owner-enforced ownership, TLS required |
| B4 | Break-glass user to AWS | Long-lived IAM user, MFA, alarmed on every write |
| B5 | Databricks to AWS | Planned: cross-account role assumed by the Databricks AWS account, gated on an external ID |

## Who we are defending against

| Actor | Capability | Motivation | Realistic here? |
|---|---|---|---|
| Opportunistic scanner | Finds exposed buckets and leaked keys automatically | Cryptomining, data resale | Yes — constant background noise on any public cloud |
| Credential thief | Phishes or credential-stuffs a personal account | Compute for mining; pivot to other systems | Yes, and this is the live gap |
| Supply-chain attacker | Compromises a GitHub Action or an npm package | Reach many downstream accounts at once | Plausible; has happened repeatedly in the wild |
| Malicious insider | Legitimate access, abused | Not applicable — single operator | No; modelled anyway, because controls should not assume one honest user |
| The operator, in error | Full authority, no malice | None | **Most likely of all.** Most damage in small estates is self-inflicted |

The honest ranking for a single-operator portfolio account: operator error first,
credential theft second, supply chain third, targeted attack a distant fourth.

## Threats

Severity is Critical, High, Medium or Low. Items marked *Planned* concern components
that do not exist yet and are recorded so the control is designed in rather than
retrofitted.

| ID | Threat | STRIDE | Severity | What stops it today | Residual risk |
|---|---|---|---|---|---|
| T-01 | GitHub account taken over; attacker pushes to `main` and reaches AWS through the deploy role | S, E | **Critical** | The deploy role is scoped to specific S3, IAM, CloudTrail and Budgets actions and cannot launch compute. Trust is pinned to `main` of one repository by immutable numeric ID | Two-factor authentication is off, so a password is the only barrier. The role can still rewrite IAM, including its own trust policy |
| T-02 | Direct push to `main` with no review | T, E | **Critical** | Nothing technical. The deploy workflow requires the operator to type `apply`, which is a typo guard, not an authorisation control | Branch protection and environment reviewers are unavailable on the free plan for a private repository |
| T-03 | Compromised GitHub Action or npm dependency steals the OIDC token or acts inside the AWS session | T, E | High | Every action pinned to a full commit SHA rather than a tag. `permissions:` is minimal per job, and `id-token: write` is granted only where needed. Terraform and Checkov versions pinned | A pinned action's own transitive dependencies are not pinned. `semantic-release` runs with `contents: write` over a large npm dependency tree |
| T-04 | Stolen workstation session credentials | S | Medium | Credentials are short-lived and browser-issued; no access keys on disk | A live session remains usable until it expires. No alarm on an unexpected source address |
| T-05 | Break-glass administrator identity abused | E | Medium | MFA on the user; every non-read action matches a tested metric filter and drives an alarm to a confirmed inbox | Detection, not prevention. The alarm fires after the act, not instead of it |
| T-06 | Root account used | E | Low | Root MFA enabled, no root access keys, decision D-007 forbids use, tested alarm on any root activity | Root can disable the alarm, though doing so is itself a logged event |
| T-07 | Audit trail stopped or logs deleted to hide activity | R, T | **High** | Log file validation enabled, bucket versioned, `prevent_destroy` on the bucket, trail is multi-region | **No alarm on `StopLogging`, `DeleteTrail` or event-selector changes.** Logs live in the same account as the workloads they describe, which only a separate Log Archive account fixes. No S3 Object Lock |
| T-08 | IAM quietly changed to widen access | E | High | Every IAM change is captured in CloudTrail and in the S3 record | **No alarm on IAM policy or role changes.** A widened deploy role would be recorded, but nobody would be told |
| T-09 | A bucket is exposed publicly | I | Medium | All four buckets carry a public access block on all four settings, bucket-owner-enforced ownership and a TLS-only policy. Verified directly against AWS | **The account-level public access block is not managed by Terraform.** A bucket created outside Terraform inherits no guard |
| T-10 | Terraform state read by an unauthorised party | I | Medium | Private bucket, encrypted at rest, TLS enforced, never committed to Git, and CloudTrail object-level events recorded on it | Encryption uses S3-managed keys, so there is no key-level revocation or independent decryption audit. A stale local `terraform.tfstate` remains on the workstation from before the backend migration |
| T-11 | Two applies run at once and corrupt state | T | Low | S3 native state locking (`use_lockfile=true`), and the deploy workflow's concurrency group prevents overlapping runs | A break-glass apply from a workstation bypasses the workflow, though it still takes the lock |
| T-12 | Denial of wallet: an attacker, or a forgotten resource, burns the budget | D | Medium | Budget alerts at 50% and 80% actual and 100% forecast, to a confirmed inbox. Nothing hourly-billed is deployed. The deploy role cannot create compute | Budget alerts lag real spend by hours. There is no hard stop — an alert is a message, not a brake. The budget cannot see Databricks charges at all |
| T-13 | Confused deputy on the Databricks cross-account role | E | *Planned* | Not yet built | Design requirement recorded: the trust policy must require `sts:ExternalId` equal to our Databricks account ID. Without that condition, any Databricks customer could assume the role |
| T-14 | Real personal or payment data enters a platform designed for synthetic data | I | *Planned* | Policy only: synthetic data, no real PII or card data | Needs a technical control before ingestion begins, not a rule in a document |
| T-15 | An agent produces a plausible but wrong finance narrative | T | *Planned* | None yet | Requires source citations, deterministic metrics, evaluation and human review before any output is trusted |
| T-16 | Prompt injection reaching an agent through ingested data | T, E | *Planned* | None yet | All ingested content must be treated as untrusted input to the model; agent tools must be read-only and separately authorised |

## Findings

Four gaps worth acting on, in priority order. The two most serious cost nothing.

### F-1 — Two-factor authentication is off on the GitHub account (Critical)

Verified: the GitHub API reports `two_factor_authentication: false` for the account
that owns both repositories.

That account can push to the `main` branch that the AWS trust policy accepts. The
entire chain of hardening on the AWS side — immutable numeric repository IDs, scoped
policies, no stored keys — sits behind a single password, and all of it is bypassed
by one successful phish.

Fix: enable two-factor authentication on GitHub, preferably with a hardware key or an
authenticator app rather than SMS. Five minutes, no cost.

### F-2 — Nothing prevents a direct push to `main` (Critical)

Verified: the branch protection API returns HTTP 403 with `Upgrade to GitHub Pro or
make this repository public`, and the `aws-bootstrap` environment reports
`protection_rules: []` with no deployment branch policy and `can_admins_bypass: true`.

The deploy workflow asks the operator to type `apply`. That prevents an accidental
click. It does not prevent anyone with push access from committing a change and
deploying it entirely unreviewed.

Three ways out, and the choice is a genuine trade-off:

1. **Make the repository public.** Branch protection, required reviews and required
   status checks all become free. This suits a portfolio project that is meant to be
   read, and it enforces the discipline of never committing anything sensitive. The
   cost is that any future mistake is public the moment it is pushed.
2. **Upgrade to GitHub Pro.** Keeps the repository private, costs a few dollars a
   month.
3. **Accept it**, and record that the review gate is procedural rather than enforced.

Recommendation: option 1. The repository contains no secrets by design, the account
identifier is deliberately kept out of Git, and a portfolio project nobody can read
is worth less than one they can.

### F-3 — No alarm on changes to the audit trail or to IAM (High)

The trail records these events faithfully. Nobody is told about them.

This is exactly the argument that justified building the alerting layer in the first
place: a record nobody reads is not a detection. The two existing detections cover
break-glass writes and root usage. Neither covers an attacker who arrives through
CI, widens the deploy role, and then stops the trail.

Fix: two more metric filters on the log group that already exists — one matching
`StopLogging`, `DeleteTrail`, `UpdateTrail` and `PutEventSelectors`; one matching IAM
write events against this project's roles and policies. Both reuse the existing log
group, topic and subscription, so the marginal cost is effectively zero.

### F-4 — The account-level S3 public access block is not managed (Medium)

Every bucket carries its own block, verified. The account-level setting, which
applies to buckets that do not carry their own, is absent from the Terraform and its
live value is unverified.

The landing-zone design already calls for this at "account and bucket levels", so
this is a gap against our own stated design rather than an open question.

Fix: add `aws_s3_account_public_access_block`, with the matching deploy-role
permission granted in the preceding apply, following the established two-phase
pattern.

Minor, noted but not tracked as a finding: a stale `terraform.tfstate` from before the
S3 backend migration is still present on the workstation. It is correctly gitignored.
Delete it once the remote state is confirmed authoritative, so that only one copy of
the truth exists.

## What is deliberately accepted

These are constraints of a single-account portfolio project, chosen with reasons
recorded. They are not oversights.

- Logs live beside the workloads they describe. Only a separate Log Archive account
  fixes this, and creating an AWS Organization would forfeit the Free plan credit.
- There are no Service Control Policies, so there is no ceiling that a sufficiently
  privileged role cannot raise.
- Encryption uses S3-managed keys rather than customer-managed KMS keys. The
  reasoning and the revisit triggers are recorded in the Checkov exception register
  in the infrastructure repository.
- GuardDuty and Security Hub are unavailable on the Free plan.
- Detection is email to a single inbox. There is no on-call rotation and no second
  channel.

## Revisit triggers

Redo this exercise when any of the following happens:

- the Databricks workspace exists and the cross-account role is built
- real data, or anything classified above `internal`, enters the platform
- a second human gains access to the repositories or the account
- an agent gains any tool that can write, spend or send
- the account joins an AWS Organization

## Related

- [Control matrix](control-matrix.md) — every control, its status and its evidence
- [Responsibility matrix](responsibility-matrix.md) — who owns each control
