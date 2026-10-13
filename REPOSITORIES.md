# Repository Map

**Contents:** [TL;DR](#tldr) · [Repositories](#repositories) · [Rules](#rules)

Detail: [`cmdb.yml`](cmdb.yml) → `decisions` (D-011).

## TL;DR

| Question | Answer |
|---|---|
| How many repos? | Three: control plane, infra, data |
| Where are ML and the agent? | In the data repo (D-011, amended 2026-10-04) |
| Who owns which? | Infra repo = platform team (provisions); data repo = finance data & AI product team (deploys jobs, models, agent) ([stakeholders](docs/conception/stakeholders.md#who-provisions-who-deploys)) |
| Why not five, as first planned? | One product team, one deploy identity and one bundle; two extra repos would add CI and permissions with no separate owner to justify them |

## Repositories

> **TL;DR:** docs here, platform in infra, everything that runs on data in the data repo.

| Repository | Does | Status |
|---|---|---|
| `retail-finance-platform-control-plane` (this one, public since 2026-09-26) | Context, status and roadmap, architecture, decisions, security docs | Active |
| `retail-finance-platform-infra` (public) | Terraform for AWS, Databricks and the GCP agent stack; CI/CD | Active |
| `retail-finance-data-products` (public) | Synthetic data, Bronze/Silver/Gold, data quality, ML (`jobs/ml.py`), drift checks, agent tools and the agent (`agent/`) | Active |

The planned `retail-finance-ml-platform` and `retail-finance-agent-platform` repos were never
created. If ML or the agent ever get their own team and release cycle, that is the time to split.

## Rules

> **TL;DR:** dependencies flow one way; repos talk through versioned interfaces.

- Dependencies flow one way: control plane → infra → data (jobs, ML, agent).
- Repos talk through versioned interfaces (Terraform outputs, schemas, APIs),
  never through each other's uncommitted files.
- This repo holds no deployable code.

Local paths (Windows / WSL): `C:\Users\cheik\.vscode\<repo>` /
`/mnt/c/Users/cheik/.vscode/<repo>`. Never assumed by CI.
