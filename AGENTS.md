# AGENTS.md

**Contents:** [TL;DR](#tldr) · [Read first](#read-first) · [Hard rules](#hard-rules) · [How we work](#how-we-work) · [How to report](#how-to-report) · [Environment gotchas](#environment-gotchas) · [Where things are](#where-things-are)

Instructions for any AI assistant (or new human) working on this project. Tool-neutral;
`CLAUDE.md` just imports this file.

## TL;DR

| Question | Answer |
|---|---|
| What is the project? | A finance data, ML and AI agent platform for the accounting team of a large (fictional) retailer, on AWS eu-central-1 + Databricks, built the enterprise way |
| Where are we? | [STATUS.md](STATUS.md) |
| What must never happen? | Secrets or account IDs in Git, root use, unreviewed infra changes, real personal data, an agent acting without a human |
| How is work organised? | Stories with acceptance criteria ([docs/stories/](docs/stories/README.md)); facts in `cmdb.yml`; design in [docs/architecture/](docs/architecture/hld.md) |
| Definition of done | Acceptance criteria ticked, tests green in CI (continuous integration), proof recorded, review checklist passed, cmdb and STATUS updated |

## Read first

> **TL;DR:** four files give you the whole picture in ten minutes.

| Order | File | Gives you |
|---|---|---|
| 1 | [STATUS.md](STATUS.md) | Goal, roadmap, where we are, what is next, deadlines, open risks |
| 2 | [docs/architecture/hld.md](docs/architecture/hld.md) | How the platform fits together (then the LLDs) |
| 3 | [docs/stories/README.md](docs/stories/README.md) | What was built, what went wrong, what is planned |
| 4 | [cmdb.yml](cmdb.yml) | Inventory: decisions, risks, controls, lessons, stories index |

Infra and data repos have their own `cmdb.yml` (resources, incidents, pipeline); see [REPOSITORIES.md](REPOSITORIES.md).

## Hard rules

> **TL;DR:** security and cost rules are not negotiable; ask before anything irreversible. Detail: [`cmdb.yml`](cmdb.yml) → `rules`, `decisions`

1. **No secrets, Terraform state, plans, `*.tfvars` or account IDs in Git.** Never print a secret (the Databricks secret is read from `~/.databrickscfg` or GitHub secrets, never shown).
2. **Never use the AWS root user.** Humans use the named IAM user; CI uses OIDC (no stored keys).
3. **Infra and data repos: every change by pull request**, required checks green, deploy only through the gated GitHub workflows. **The control plane (docs) needs no PR**: push to `main`.
4. **Two-phase IAM changes:** grant in one apply, use in the next; run the IAM policy simulator first.
5. **Synthetic data only.** No real personal, customer or card data.
6. **Budgets before spend.** USD 50/month AWS budget; Databricks trial ends 2026-10-06, tear down that day.
7. **Agents are read-only** on finance data; posting entries, moving money or approving payments always needs a human.
8. **Commits use the owner's personal GitHub identity**, never an employer address. Check before committing.
9. **Before any cloud CLI command, check which account it targets.** The workstation also holds employer credentials (gcloud).
10. **Ask first** before destroying resources, rewriting history, changing visibility or spending money beyond a job run.

## How we work

> **TL;DR:** story first, small PRs, prove it, review it, record it.

| Step | What |
|---|---|
| 1 · Story | New work gets a planned story with acceptance criteria before building (`docs/stories/`) |
| 2 · Build | Small PRs; tests first where possible; follow the architecture docs |
| 3 · Prove | CI green, run on the workspace, numbers recorded; failures diagnosed from evidence (logs, flow logs), not guessed |
| 4 · Review | A separate pass (fresh session or second person) runs the [review checklist](docs/stories/README.md#review-checklist) on the story and diff; findings fixed or accepted with a reason |
| 5 · Record | Story becomes as-built (proof, tricky parts: symptom → cause → fix → lesson); `cmdb.yml` gets IDs, status, one-line reasons and story links; STATUS updated |

**Docs rules:** every `.md` starts with a contents line and a TL;DR table, each section has a
one-line TL;DR, and points to cmdb keys. Short and plain. Each fact lives in one place:
`cmdb.yml` = what, stories = why and how.

## How to report

> **TL;DR:** short, plain, honest.

- Start with a plain-words answer; tables over paragraphs.
- Name a technical term, then say what it means.
- Separate verified from planned; say what gets created or destroyed and what it costs.
- If something failed, say so with the evidence.
- Chat and docs in English.

## Environment gotchas

> **TL;DR:** WSL2 on Windows; a few traps cost time. Detail: infra and data `cmdb.yml` → `toolchain`

| Trap | Do this |
|---|---|
| Terraform can't read `aws login` sessions | `eval "$(aws configure export-credentials --format env)"` |
| AWS CLI default region is eu-north-1 | Pass `--region eu-central-1` |
| Local Spark tests need Java | `export JAVA_HOME=$HOME/.local/jdk17` (user-level JRE) |
| Local Databricks profile is account-level only | For workspace calls set `DATABRICKS_HOST` to the workspace URL and reuse the client ID/secret from `~/.databrickscfg` without printing them |
| PowerShell → WSL mangles `$` and quotes | Use single quotes, or write a script file and run `wsl -e bash script.sh` |
| Git Bash rewrites `/mnt/c` paths | Prefix with `MSYS_NO_PATHCONV=1` |
| draw.io export | Absolute Windows paths, one export at a time |

## Where things are

> **TL;DR:** three repos, one purpose each.

| Repo | Owns |
|---|---|
| [retail-finance-platform-control-plane](https://github.com/kheuchi/retail-finance-platform-control-plane) (this) | Status, architecture, stories, security docs, decisions (`cmdb.yml`) |
| [retail-finance-platform-infra](https://github.com/kheuchi/retail-finance-platform-infra) | Terraform: AWS foundation, network, Databricks workspace, guardrails |
| [retail-finance-data-products](https://github.com/kheuchi/retail-finance-data-products) | Generator, Bronze/Silver/Gold jobs, tests, Databricks bundle |
