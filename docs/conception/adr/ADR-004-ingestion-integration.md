# ADR-004 · Ingestion and integration: files in, iPaaS only on the way out

**Contents:** [TL;DR](#tldr) · [Context](#context) · [Options](#options) · [Decision](#decision) · [Consequences](#consequences) · [Revisit when](#revisit-when)

Accepted · 2026-10-04 · cmdb: D-025, D-030 · Docs: [business case](../business-case.md#target-workflow-to-be) · Stories: [3.1](../../stories/3.1-synthetic-accounting-data.md), [3.3](../../stories/3.3-first-job-in-the-private-vpc.md)

## TL;DR

| | |
|---|---|
| Decision | Sources land as files in S3 (SAP replication, managed file transfer, API pulls); Auto Loader loads Bronze. The company iPaaS carries approved outputs to Teams and ServiceNow |
| Rejected | iPaaS (MuleSoft, Workato) for bulk ingestion; streaming (Kafka) for the close; direct database reads from SAP |
| Main reason | Bulk finance extracts are files; iPaaS is built for app-to-app events, priced per task |
| In this project | Sources simulated by a generator writing files (synthetic data, D-025); outbound not built |

## Context

> **TL;DR:** millions of receipt lines a night, a ledger in SAP, a close that runs daily, not real-time.

The close needs complete, reproducible daily data, not second-by-second events. SAP must not be
loaded by ad-hoc queries. Store systems already produce nightly files.

## Options

> **TL;DR:** files for bulk, iPaaS for events.

| Option | For | Against |
|---|---|---|
| **Files to S3 + Auto Loader** | Cheap at volume; replayable; Bronze keeps the file name for lineage | Batch latency (fine for a close) |
| iPaaS (MuleSoft, Workato) inbound | Already in many enterprises; many connectors; some batch support | Designed and priced for app integration (MuleSoft by flows and messages, Workato by tasks); bulk files are cheaper by file transfer |
| Apache NiFi | Strong for routing files and streams on-premises | Another platform to run; adds little over managed file transfer here |
| Kafka streaming | Real-time | No real-time need in the close; cost and operations |
| Managed connectors (Fivetran, Lakeflow Connect, SAP Datasphere, SAP Business Data Cloud) | Less custom code for SAP | Licences: Datasphere replication to S3 needs SAP's outbound integration licence; third-party extraction through SAP's ODP interface is restricted by SAP |
| **iPaaS outbound** | App-to-app events are what it is for; reuses the company's integrations to Teams and ServiceNow | Not built in this project |

## Decision

> **TL;DR:** every source lands as files; approved outputs leave through the iPaaS.

Inbound: SAP via CDS extraction views on the universal journal, replicated by SAP Datasphere to S3 (or shared by SAP Business Data Cloud); POS via managed file transfer;
ECB via a daily API pull; budget and cashier master via monthly exports. Bronze by Auto Loader,
untyped, with the source file on every row. Outbound: approved items only, through the iPaaS.

## Consequences

> **TL;DR:** one ingestion pattern and full lineage; a day of latency.

| Good | Bad |
|---|---|
| One ingestion pattern for every source | Schema changes at source arrive as files that may break Silver (caught by quarantine and checks) |
| Every Gold number traces to a file | Batch latency of a day |
| iPaaS used where it adds value | Outbound integration remains to be built |

## Revisit when

> **TL;DR:** a real-time need.

A real-time need appears (e.g. fraud blocking at the till), which would justify streaming.
