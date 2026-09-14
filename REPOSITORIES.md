# Repository Map

This is the canonical map for the retail-finance platform repository family.
Update it whenever a repository is created, renamed, moved, archived, or changes
ownership.

## Active repositories

| Repository | Responsibility | Windows path | WSL path | Status |
|---|---|---|---|---|
| `dataMLPlatform` | Program control plane: shared context, roadmap, cross-repository decisions, progress, and AI/human orchestration | `C:\Users\cheik\.vscode\dataMLPlatform` | `/mnt/c/Users/cheik/.vscode/dataMLPlatform` | Active |
| `retail-finance-platform-infra` | Terraform for AWS/Databricks foundations, security controls, state, networking, governance, and infrastructure CI/CD | `C:\Users\cheik\.vscode\retail-finance-platform-infra` | `/mnt/c/Users/cheik/.vscode/retail-finance-platform-infra` | Active |

## Planned repositories

| Repository | Responsibility | Planned Windows path | Planned WSL path | Status |
|---|---|---|---|---|
| `retail-finance-data-products` | Ingestion, contracts, transformations, data quality, and finance gold products | `C:\Users\cheik\.vscode\retail-finance-data-products` | `/mnt/c/Users/cheik/.vscode/retail-finance-data-products` | Planned |
| `retail-finance-ml-platform` | Feature engineering, training, evaluation, registry, deployment, and model monitoring | `C:\Users\cheik\.vscode\retail-finance-ml-platform` | `/mnt/c/Users/cheik/.vscode/retail-finance-ml-platform` | Planned |
| `retail-finance-agent-platform` | Agent orchestration, read-only tools, evaluations, APIs, and user interface | `C:\Users\cheik\.vscode\retail-finance-agent-platform` | `/mnt/c/Users/cheik/.vscode/retail-finance-agent-platform` | Planned |

## Dependency direction

```text
control plane
    ├── infrastructure
    ├── data products      → consumes infrastructure outputs
    ├── ML platform        → consumes governed data products
    └── agent platform     → consumes certified data and ML serving interfaces
```

Repositories must communicate through versioned interfaces—Terraform outputs,
data contracts, schemas, APIs, model versions, and release artifacts—not by reading
another repository's uncommitted working files.

## Control-plane rules

- This repository contains coordination and evidence, not deployable application or
  infrastructure code.
- Each implementation repository has its own README, context ledger, tests, release
  lifecycle, CI/CD workflow, and security boundary.
- Cross-repository architecture decisions are recorded here and linked from the
  affected repositories.
- Absolute paths are local-machine mappings only and must never be assumed by CI.
