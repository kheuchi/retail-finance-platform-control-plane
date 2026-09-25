# Project Context

The one page a human or an AI assistant reads first. Detail is in [cmdb.yml](cmdb.yml).

## Goal

Show how a large retailer's accounting department could run governed finance data,
ML and an AI agent on AWS + Databricks, built the way an enterprise would build it.

The agent may investigate, summarise and recommend. It never posts journal entries,
moves money or approves payments. A human signs off.

## Rules

1. No secrets, Terraform state or account IDs in Git.
2. Short-lived access only. CI uses OIDC. No root account.
3. No infrastructure change without a reviewed Terraform plan, merged by PR.
4. Synthetic data only. No real personal or card data.
5. Budgets before spend. USD 50/month on AWS. Tear down after the trial.
6. **Docs stay short and readable. Detail goes in `cmdb.yml`.**

## How assistants report

- Start with a plain-words TL;DR. Keep it short.
- Name technical terms, then say what they mean.
- Separate what is verified from what is planned.
- Say what gets created or destroyed, and what it costs.

## Current state (2026-09-25)

| Area | State |
|---|---|
| AWS foundation | Done: Terraform, CI/CD via OIDC, CloudTrail, alarms, budget |
| Network | Done: private VPC, no internet egress, PrivateLink to Databricks |
| Databricks | Done: classic Enterprise workspace, Unity Catalog on our S3 |
| Data, ML, agent | Not started |
| Running cost | ~USD 2/day for network endpoints; clusters extra when running |

## Next actions

1. Cluster guardrails: auto-termination, size limits.
2. Synthetic ERP and POS data, ingested into Bronze.
3. Silver and Gold finance tables with reconciliation checks.
4. Teardown by **2026-10-06** (trial end): workspace off, network off.

## Open risks

GitHub 2FA off (accepted) · network costs above budget if left on ·
trial auto-converts to paid on 2026-10-06 · Databricks secret expires ~2026-10-08 ·
employer credentials on the workstation. Full list: `cmdb.yml` → `risks`.
