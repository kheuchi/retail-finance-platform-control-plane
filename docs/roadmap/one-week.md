# One-Week Delivery Roadmap

## Outcome

Deliver one thin but complete path from governed AWS infrastructure through retail
finance data ingestion, transformation, ML, and an evidence-backed agent analysis.
Enterprise breadth that cannot be safely deployed within the budget is represented
by tested code, architecture, controls, and explicit exceptions.

## Day 1 — Foundation

- Verify identity, account and cost constraints.
- Define architecture, naming, tagging and threat assumptions.
- Bootstrap Terraform state and deploy budgets/audit baseline.
- Add formatting, validation, linting and security checks.

Exit criterion: reviewed Terraform plan plus cost guardrails and audit foundation.

## Day 2 — Data platform

- Provision encrypted raw, curated and artifact storage.
- Establish data roles and access policies.
- Configure Databricks trial/workspace path and Unity Catalog integration.
- Define finance data contracts and classifications.

Exit criterion: governed storage and Databricks connectivity are demonstrated.

## Day 3 — Ingestion and quality

- Ingest public retail data and generated ERP/finance data.
- Implement bronze and silver transformations.
- Add schema, freshness, completeness, uniqueness and reconciliation tests.

Exit criterion: repeatable ingestion produces validated, traceable silver data.

## Day 4 — Finance products

- Build gold models for revenue, refunds, cost, gross margin and variance.
- Add semantic definitions and finance reconciliation controls.
- Produce an executive finance dashboard or SQL serving layer.

Exit criterion: certified metrics reconcile to controlled inputs.

## Day 5 — ML lifecycle

- Train demand or revenue forecast and anomaly-detection models.
- Track experiments, parameters, metrics and artifacts.
- Register the selected model and define promotion criteria.
- Add drift and data-quality monitoring design.

Exit criterion: a reproducible model moves through a governed lifecycle.

## Day 6 — Agentic analysis and CI/CD

- Give the agent read-only tools over certified metrics and operational metadata.
- Require citations to source tables, timestamps and model versions.
- Add evaluations for correctness, authorization and unsafe actions.
- Implement CI/CD with GitHub OIDC and environment approval gates.

Exit criterion: agent produces a traceable variance narrative and cannot perform
consequential finance actions.

## Day 7 — Assurance and teardown

- Run security, policy, data quality and recovery checks.
- Complete WAF review and control evidence.
- Demonstrate the end-to-end scenario.
- Destroy or suspend chargeable workload resources.
- Record residual cost, known gaps and interview talking points.

Exit criterion: reproducible demo, evidence pack and verified cost-safe end state.

## Scope rule

If time becomes constrained, preserve the end-to-end vertical slice and automate it.
Defer additional datasets, dashboards and models rather than leaving security,
lineage, testing or teardown implicit.
