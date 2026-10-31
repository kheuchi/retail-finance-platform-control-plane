# Platform landscape

**Contents:** [TL;DR](#tldr) · [Views](#views)

Updated 2026-10-30. Detail: [`cmdb.yml`](../../cmdb.yml) → `architecture`. Diagrams: [HLD](../architecture/hld.md), [reference architecture](../conception/reference-architecture.md).

## TL;DR

| Question | Answer |
|---|---|
| What is it? | A page of the site that shows every part of the platform as tiles, by layer, in the style of a technology landscape |
| How to open it | On the site: [landscape](https://kheuchi.github.io/retail-finance-platform-control-plane/landscape/platform-landscape.html), [architecture](https://kheuchi.github.io/retail-finance-platform-control-plane/architecture/architecture.html) (GitHub Pages, built from `site/`; content in `site/src/data/landscape.ts`) |
| What can I do on it? | Switch views, pick a run step to light up the parts it uses, pick a tile for detail |

## Views

> **TL;DR:** what runs, what we would build, how we would know it works.

| View | Shows |
|---|---|
| As built | People, agent, tools and gateways, data, ML, compute, identity, network, observability, delivery; one month-end run in 7 steps |
| Target | The margin recovery agent: users, AI gateway and agent, knowledge, ML, lakehouse, streaming and live APIs, sources; one run in 9 steps |
| Evaluation and monitoring | 22 checks: the question, how we check it, the indicator and target, and whether it is in place today |
