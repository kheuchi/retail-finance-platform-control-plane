# Repository Map

**Contents:** [Rules](#rules)

| Repository | Does | Status |
|---|---|---|
| `retail-finance-platform-control-plane` (this one, public since 2026-09-26) | Context, status and roadmap, architecture, decisions, security docs | Active |
| `retail-finance-platform-infra` (public) | Terraform for AWS and Databricks, CI/CD | Active |
| `retail-finance-data-products` (public) | Synthetic data, ingestion, Bronze/Silver/Gold, data quality | Active |
| `retail-finance-ml-platform` | Features, training, registry, serving | Planned |
| `retail-finance-agent-platform` | Agent tools, evaluation, UI | Planned |

## Rules

- Dependencies flow one way: control plane → infra → data → ML → agent.
- Repos talk through versioned interfaces (Terraform outputs, schemas, APIs),
  never through each other's uncommitted files.
- This repo holds no deployable code.

Local paths (Windows / WSL): `C:\Users\cheik\.vscode\<repo>` /
`/mnt/c/Users/cheik/.vscode/<repo>`. Never assumed by CI.
