# Retail Finance Data, ML and Agentic AI Platform

An enterprise-style learning project built on AWS and Databricks for a fictional
retail finance department.

## Plain-language goal

Build a secure data platform that can explain revenue and margin, forecast results,
detect unusual activity, and generate traceable finance narratives. The project
models enterprise practices while remaining affordable for a personal AWS account.

## Current approach

- Preserve the AWS Free plan and its credits.
- Keep bootstrap state in `eu-west-3` (Paris) and deploy workloads in
  `eu-central-1` (Frankfurt) for custom model and agent-serving support.
- Maintain a production-ready multi-account Control Tower design without activating
  AWS Organizations during the Free plan.
- Provision infrastructure with Terraform and deploy workloads through CI/CD.
- Use Databricks for governed data engineering, analytics, ML, and AI.
- Tear down or suspend chargeable workload resources after the one-week build.

## Repository role

This repository is the program control plane used by humans and AI assistants to
coordinate the other repositories. It contains context, decisions, roadmap, and
cross-repository evidence—not deployable infrastructure or application code.

## Start here

- [Project context and progress](PROJECT_CONTEXT.md)
- [Repository map](REPOSITORIES.md)
- [One-week roadmap](docs/roadmap/one-week.md)

No AWS resources have been created by this repository yet.
