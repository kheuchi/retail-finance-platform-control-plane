# Memo: what we built and what bit us

**Contents:** [TL;DR](#tldr) · [Stage by stage](#stage-by-stage) · [Top 10 lessons](#top-10-lessons) · [Open items](#open-items)

One page. Each line links to the full story. Updated 2026-10-04. Index: [stories](README.md).
To explain how it works underneath (decisions, mechanics, likely questions): [WALKTHROUGH](WALKTHROUGH.md).

## TL;DR

| | |
|---|---|
| What exists | A private Databricks lakehouse on AWS for a retailer's accounting team: governed data, a reconciliation that catches fake journals, certified finance tables, fraud models |
| Proof it works | All 3 planted frauds found: 4/4 fake journals (reconciliation), S017-C03 and S031 ranked #1 by models trained without the answer |
| How it is run | Everything as code, by pull request; three identities, each unable to do the others' job |
| What bit us most | Permissions (IAM, grants, visibility), a blocked network port, and our own bugs caught by our own checks |
| What is left | The AI agent (stage 7, [ADR-006](../conception/adr/ADR-006-agent-platform.md)), teardown 2026-10-06 |

## Stage by stage

> **TL;DR:** one line per story: what, the trap, the lesson.

| Story | Built | The tricky part | Lesson |
|---|---|---|---|
| [1.1](1.1-aws-account-baseline.md) | AWS account, remote state, budget | Control Tower would have burned the free credits | Read billing terms before drawing architecture |
| [1.2](1.2-passwordless-cicd.md) | GitHub → AWS with no stored keys (OIDC) | GitHub's token subject uses numeric IDs, not names | Build trust policies from the real token, not tutorials |
| [1.3](1.3-least-privilege-deploy-role.md) | Tight deploy role, break-glass | A role cannot grant itself the permission it lacks | Grant in one apply, use in the next |
| [1.4](1.4-audit-and-alarms.md) | Audit trail and alarms | An alarm filter that parsed fine and never fired | A detection is done only when you saw it fire |
| [1.5](1.5-security-review-going-public.md) | Threat model, history scrub, public repos | The history rewrite orphaned 10 release tags | Verify against the remote, not your clone |
| [2.1](2.1-where-databricks-runs.md) | Chose AWS + classic workspace + PrivateLink | Azure's trial billed a NAT gateway with nothing running | Trial credits never pay for cloud infrastructure |
| [2.2](2.2-private-network.md) | VPC with no internet at all | Scanners are blind to switched-off code | A clean scan of code that creates nothing proves nothing |
| [2.3](2.3-workspace-as-code.md) | Workspace built by Terraform | "OAuth error" that was really a missing field | When one resource fails auth and others don't, suspect the resource |
| [2.4](2.4-unity-catalog-on-our-s3.md) | Governance layer on our own bucket | The role needs an ID that only exists after the first step | Some create orders are not the obvious one |
| [2.5](2.5-guardrails.md) | Small clusters, locked egress, budget alerts | Undocumented 32-character limit | Find limits with read-only calls, then encode them |
| [3.1](3.1-synthetic-accounting-data.md) | Realistic books with 3 planted frauds | The ledger must balance to the cent so only frauds break it | Build the answer key into the data |
| [3.2](3.2-catalog-and-bundle-deploy.md) | Catalog, bundle deploy from CI | Code in a shared folder runs with the job's power | Deploy to the job identity's own folder |
| [3.3](3.3-first-job-in-the-private-vpc.md) | First job in the private network | Four failed runs; a blocked port (8443) | Read the flow logs: the REJECT names the port |
| [4.1](4.1-silver-tables.md) | Typed, checked, deduplicated data | Timeout (work done 3×); our FX table missed 1 January | Quarantine, never filter: it caught our own bug |
| [4.2](4.2-gl-pos-reconciliation.md) | Ledger vs tills: 4/4 fake journals | Not accusing the genuine journal | An independent reviewer finds what the author never tested |
| [4.3](4.3-gold-finance-tables.md) | Finance tables; both other frauds visible | A leak check that would block every run | Judge each grant where it was made |
| [4.4](4.4-quality-and-lineage.md) | Quality gates, certified Gold, row trace | A new check fired on clean data (FX on refunds) | Compare money in the currency it was paid in |
| [4.5](4.5-split-service-principals.md) | Deployer and runner identities | The runner cannot see who else has access | The worker cannot be the auditor: move the check |
| [5.1](5.1-fraud-detection.md) | Fraud detectors, both frauds #1 | The baseline was slowly absorbing the fraud | Compare with a past that skips recent months |
| [5.2](5.2-revenue-forecast.md) | Forecast; baseline beats the model | The first backtest was rigged by accident | Count each side's training data before trusting the winner |
| [6.1](6.1-scheduled-pipeline.md) | One scheduled pipeline with failure email | The runner could be each job's identity but not start the jobs | An orchestrator needs rights on what it orchestrates |
| [6.2](6.2-drift-checks.md) | PSI input drift; nightly config-drift check | PSI read noise on 40 stores and nothing on mostly-zero features | Calibrate a metric on clean data before trusting its alarms |
| [Docs](README.md#how-the-docs-work) | Short docs, cmdb, diagrams, stories, AGENTS.md | 1,411 lines nobody would read | One fact, one place: cmdb says what, stories say why |

## Top 10 lessons

> **TL;DR:** the ten worth repeating in an interview. All in [`cmdb.yml`](../../cmdb.yml) → `lessons`.

1. **Grant in one apply, use in the next**: permissions and their use race each other ([1.3](1.3-least-privilege-deploy-role.md)).
2. **See a detection fire** before calling it done ([1.4](1.4-audit-and-alarms.md)).
3. **Trial credits pay the vendor, never your cloud bill** ([2.1](2.1-where-databricks-runs.md)).
4. **Flow logs over guesses**: they named the blocked port in minutes ([3.3](3.3-first-job-in-the-private-vpc.md)).
5. **Quarantine, never filter**: a silent drop would have hidden our own FX bug ([4.1](4.1-silver-tables.md)).
6. **Reconcile the way the books were built**, then a 1-cent tolerance is honest ([4.2](4.2-gl-pos-reconciliation.md)).
7. **Independent review before merge**: it found a high-severity issue in every story it reviewed ([4.2](4.2-gl-pos-reconciliation.md)-[5.2](5.2-revenue-forecast.md)).
8. **A gate must certify the exact data version it checked** ([4.4](4.4-quality-and-lineage.md)).
9. **Separation of duties moves checks** to the identity entitled to run them ([4.5](4.5-split-service-principals.md)).
10. **Ship the baseline when it wins**: the comparison is the deliverable, not the fancy model ([5.2](5.2-revenue-forecast.md)).

## Open items

> **TL;DR:** what is not done, on purpose or not yet. Detail: [`cmdb.yml`](../../cmdb.yml) → `risks`

| Item | State |
|---|---|
| Alert email delivery (6.1) | Owner to confirm the inbox |
| Stage 7: AI agent for month-end commentary | Planned: agent as a job in our VPC, managed model over PrivateLink |
| Databricks secret expires ~2026-10-08 | Move to OIDC or tear down first |
| Access audit crashes on a schema declared but not yet created | Small infra fix pending |
| Employee-level fraud scores readable by analysts (R-12) | Accepted for synthetic data |
| GitHub 2FA off (R-01) | Accepted by the owner |
| **Teardown** | **2026-10-06** |
