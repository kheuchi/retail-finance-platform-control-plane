# ADR-003 · Compute and network: classic clusters in our VPC, PrivateLink, no NAT

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-015b, D-019, D-021 · Stories: [2.1](../../stories/2.1-where-databricks-runs.md), [2.2](../../stories/2.2-private-network.md), [3.3](../../stories/3.3-first-job-in-the-private-vpc.md) · Docs: [LLD 1](../../architecture/lld-network.md)

## TL;DR

| | |
|---|---|
| Decision | Job clusters in our own VPC with no internet gateway and no NAT; Databricks reached over PrivateLink, S3 over a gateway endpoint |
| Rejected | Serverless compute; classic compute with a NAT gateway |
| Main reason | "Finance data has no road to the internet" becomes literally true and provable |
| Main cost | ~USD 64/month of endpoints vs ~38 for NAT (above the USD 50 budget: run time-boxed); Enterprise tier; harder debugging |

## Context

> **TL;DR:** the network is the containment control for finance data.

A compromised library on a cluster with internet access can send data anywhere. Auditors and
security want proof, not a promise, that it cannot.

## Options

> **TL;DR:** only PrivateLink without NAT removes the road to the internet.

| Option | For | Against |
|---|---|---|
| Serverless | No VPC to run; fast start | Compute runs in Databricks' account, outside our VPC: only the serverless egress policy applies, no flow logs of ours |
| Classic + NAT | Cheaper, simple | A route to the whole internet remains |
| **Classic + PrivateLink, no NAT** | No public egress at all; flow logs record every attempt | Endpoint cost; every port must be opened on both ends |

## Decision

> **TL;DR:** classic job clusters, five endpoints, nothing downloaded at run time.

Classic job clusters in a customer-managed VPC (2 AZ), interface endpoints for the Databricks
workspace and relay, STS and Kinesis, a free S3 gateway endpoint; no internet gateway, no NAT.
Libraries come from the Databricks runtime or our own wheel: nothing is downloaded at run time.

## Consequences

> **TL;DR:** provable containment; every port and library must be planned.

| Good | Bad |
|---|---|
| 0 internet gateways, 0 NAT, 0 public IPs (verified in AWS) | The first job failed until port 8443-8451 was opened on the endpoint side |
| Flow logs prove what was refused | No PyPI on clusters: dependencies must be in the runtime or vendored |
| The same pattern extends to Bedrock (one more endpoint, [ADR-006](ADR-006-agent-platform.md)) | Endpoint cost runs even when idle |

## Revisit when

> **TL;DR:** private serverless, or cost over guarantee.

Serverless gains customer-controlled private networking that meets the same proof standard, or the
endpoint cost matters more than the egress guarantee.
