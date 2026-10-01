# Threat Model

**Contents:** [What we protect](#what-we-protect) · [Who we defend against, most likely first](#who-we-defend-against-most-likely-first) · [Top threats today](#top-threats-today) · [Findings from this review](#findings-from-this-review) · [Accepted on purpose](#accepted-on-purpose)

**What we protect, who might attack it, what stops them.** All 17 threats with
mitigations and residual risk are in [cmdb.yml](../../cmdb.yml) → `threats`.

## What we protect

The AWS account · Terraform state · the audit trail · the GitHub repos (code becomes
infrastructure) · finance data in S3 · the budget.

## Who we defend against, most likely first

1. **Ourselves, by mistake.** The usual cause of damage in a small estate.
2. **A credential thief** phishing a personal account.
3. **A supply-chain attack** through a GitHub Action or package.

## Top threats today

> Detail: [`../../cmdb.yml`](../../cmdb.yml) → `threats`

| Threat | Severity | Status |
|---|---|---|
| GitHub account takeover → merge to `main` → AWS deploy role | Critical | Open: 2FA off, accepted by owner |
| Audit trail stopped or IAM widened with no alert | High | Open: alarms planned |
| Cost overrun from running infrastructure | Medium | Budget alerts; teardown 2026-10-06 |
| Data leaving the network | Low | **No egress path exists**: no internet gateway, no NAT, verified in AWS |
| Another Databricks customer using our roles | Low | External IDs and principal tags on every trust |

## Findings from this review

> Detail: [`../../cmdb.yml`](../../cmdb.yml) → `findings`

| ID | Finding | Status |
|---|---|---|
| F-1 | GitHub 2FA off | Accepted, open |
| F-2 | Anyone could push to `main` | Fixed: branch protection, even for admins |
| F-3 | No alarm on trail tampering or IAM changes | Open |
| F-4 | No account-level S3 public access block | Open |

## Accepted on purpose

> Detail: [`../../cmdb.yml`](../../cmdb.yml) → `risks, decisions`

One AWS account, not many (would cost the credit) · account ID is public (repo is
public) · one person does everything · encryption uses AWS-managed keys.

Redo this review when real data, a second person, or agent write-access appears.
