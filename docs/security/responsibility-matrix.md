# Responsibility Matrix

## TL;DR

This page answers "who is responsible for what?" It matters because most cloud
security failures are not clever attacks. They are things nobody thought they owned.

Two honest observations up front.

First, one person is accountable for every row. That is not a criticism of a
portfolio project, it is a fact worth naming: there is no segregation of duties here.
The same person writes the change, approves it, deploys it and reviews the alarm it
raises. Several controls that look strong on the control matrix are weaker in
practice for that reason, and the matrix says so.

Second, AI assistants do real work in this project, so they appear as an actor with
explicit limits rather than being left out of the diagram.

## How to read this

RACI is a standard way of splitting ownership four ways:

- **R — Responsible.** Does the work.
- **A — Accountable.** Answers for the outcome. Exactly one per row, always.
- **C — Consulted.** Has input before it happens.
- **I — Informed.** Told after it happens.

## The actors

| Actor | What it is | Nature |
|---|---|---|
| **Owner** | The single human running this platform | Person |
| **CI/CD** | GitHub Actions workflows and the AWS roles they assume | Automation, no human judgement |
| **AI assistant** | Claude Code or a comparable agent working in the repositories | Automation with judgement, supervised |
| **AWS** | The cloud provider | Third party, contractual |
| **GitHub** | Source hosting and CI runners | Third party, contractual |
| **Databricks** | The lakehouse control plane | Third party, contractual, **not yet engaged** |

## The shared responsibility model

Before anything project-specific: AWS and the customer split security by a published
line. Everyone quotes it, so it is worth stating precisely.

| Layer | Who secures it |
|---|---|
| Physical data centres, hardware, the hypervisor | **AWS** |
| The managed service's own software — S3, IAM, CloudTrail itself | **AWS** |
| Availability of the service | **AWS** |
| Who may call those services, and with what permissions | **Owner** |
| Configuration of every resource, including whether a bucket is public | **Owner** |
| Encryption choices and key management | **Owner** |
| Data placed into the services, and its classification | **Owner** |
| Detecting and responding to misuse of your own account | **Owner** |

Plain words: AWS guarantees the lock works. It does not guarantee you locked the
door. Every finding in the [threat model](threat-model.md) is on the customer side of
that line, which is where findings almost always are.

Databricks adds a second, different split once engaged: Databricks operates the
control plane, and the customer owns the AWS account it reaches into, the cross-
account role that permits it, and the data in the buckets.

## Ownership by control area

| Area | Owner | CI/CD | AI assistant | AWS / third party |
|---|---|---|---|---|
| AWS account and root credentials | **A, R** | — | — | I |
| Break-glass identity and its use | **A, R** | — | — | — |
| IAM policy design | **A** | — | R | — |
| Terraform code authoring | **A** | — | R | — |
| Reviewing a plan before apply | **A, R** | — | C | — |
| Executing an apply | **A** | **R** | — | — |
| CI/CD pipeline configuration | **A** | — | R | I |
| GitHub account security, including 2FA | **A, R** | — | — | I |
| Secret and variable management | **A, R** | — | — | — |
| Responding to a security alarm | **A, R** | — | C | — |
| Cost monitoring and budget response | **A, R** | — | C | I |
| Data classification decisions | **A, R** | — | C | — |
| Accepting or rejecting a scanner finding | **A, R** | — | R | — |
| Documentation and decision records | **A** | — | R | — |
| Physical and hypervisor security | I | — | — | **A, R** (AWS) |
| Managed service patching | I | — | — | **A, R** (AWS) |
| Source hosting availability | I | — | — | **A, R** (GitHub) |
| Databricks control plane security | I | — | — | **A, R** (Databricks, once engaged) |

The pattern to notice: the Owner column is **A** on every row that is not a third
party's. That is the segregation-of-duties gap stated plainly.

## What the AI assistant may and may not do

This project uses AI assistants for real work, so the boundary is written down rather
than assumed. These rules are enforced by a mixture of tooling and the standing
instructions in `PROJECT_CONTEXT.md`.

**May, without asking:**

- read any file in either repository
- write and edit Terraform, documentation and workflow code
- run `terraform plan`, and read-only AWS and GitHub commands
- run `terraform apply` within the single approved infrastructure directory, under a
  pre-agreed scope grant

**Must ask first:**

- any change to IAM permissions
- `terraform destroy`, or deleting any stateful resource
- `terraform apply` anywhere outside the approved directory
- anything that creates ongoing cost
- force-pushing or rewriting Git history
- anything that sends data to an external service

**Must never:**

- use the root account
- write credentials, state or account identifiers into Git
- report a result it has not verified

The last one is a control, not a pleasantry. This project has already had one case
where an assistant's own monitoring script produced a false positive and reported a
match that had not occurred. It was caught by checking, and the lesson is recorded
where it happened.

**Accountability does not transfer.** An assistant can be Responsible for producing a
change. The Owner remains Accountable for every change that reaches AWS, including
ones they approved without fully reading. A reviewed plan is only a control if it is
actually read.

## Roles that do not exist yet

The landing-zone design names a fuller set of human roles. None exist, because there
is one person. They are listed so the design is not mistaken for the reality.

| Planned role | Would own | Why it does not exist |
|---|---|---|
| Platform administrator | Foundation, IAM, networking | Currently the Owner |
| Security auditor | Independent review of controls and alarms | Requires a second human; this is the segregation-of-duties fix |
| Data engineer | Ingestion, transformation, data quality | No data yet |
| Data scientist | Features, training, evaluation | No ML yet |
| Finance data owner | Classification and access approval for finance data | No real data; all synthetic |
| Finance analyst | Consumption of governed products | No products yet |

The single most valuable addition would be the security auditor, because it is the
only one that breaks the "same person writes, approves and reviews" loop. It needs a
person, not a budget.

## Escalation

| Situation | First action | Who decides |
|---|---|---|
| Security alarm fires | Check CloudTrail for the matching event and confirm whether it was you | Owner |
| Budget alert at 50% or 80% | Identify the spending resource; decide whether to stop it | Owner |
| CI/CD cannot repair itself | Follow the break-glass runbook (`docs/runbooks/break-glass.md` in the infrastructure repository) | Owner |
| Suspected credential compromise | Revoke sessions, rotate, review CloudTrail for the whole window | Owner |
| Third-party outage | Wait; no action available | AWS, GitHub or Databricks |

There is no second line and no on-call. Every path above ends at the same person,
reading one inbox. That is the correct answer for a portfolio project and the wrong
answer for anything carrying real data, and the difference is worth being able to
explain.

## Related

- [Threat model](threat-model.md)
- [Control matrix](control-matrix.md)
