<script lang="ts">
  /* Sequence diagram: one column per participant, one row per numbered message; dashed = reply. */
  import Icon from "../Icon.svelte";
  import { LY } from "../../data/architecture/helpers";
  import type { Seq } from "../../data/types";

  let { s }: { s: Seq } = $props();
  const n = $derived(s.ps.length);
  const ix = (id: string) => s.ps.findIndex(p => p.id === id);
  const rows = $derived(s.ms.map(m => {
    const a = ix(m.a), b = ix(m.b), lo = Math.min(a, b), hi = Math.max(a, b), span = hi - lo + 1;
    return { m, lo, hi, span, right: b > a, half: `calc(100% / ${span * 2})` };
  }));
</script>

<div class="scroll">
  <div class="seq" style="grid-template-columns:repeat({n}, minmax(0,1fr))">
    {#each s.ps as p}
      <div class="ph" style="--c:var({LY[p.ly]})"><Icon k={p.ic} size={16} /><span>{p.n}</span></div>
    {/each}
    {#each rows as r, k}
      {#each { length: r.lo } as _, c}<div class="ln" style="grid-column:{c + 1}"></div>{/each}
      <div class="msg" style="grid-column:{r.lo + 1} / span {r.span}">
        <div class="ar {r.right ? 'r' : 'l'}" class:back={!!r.m.back} style="left:{r.half};right:{r.half}"></div>
        <div class="lab top" style="left:{r.half};right:{r.half}"><span class="bg"><span class="num">{k + 1}</span>{r.m.l}</span></div>
        {#if r.m.p}<div class="lab bot" style="left:{r.half};right:{r.half}"><span class="bg">{r.m.p}</span></div>{/if}
      </div>
      {#each { length: n - r.hi - 1 } as _, c}<div class="ln" style="grid-column:{r.hi + c + 2}"></div>{/each}
    {/each}
    {#each s.ps as _, c}<div class="vl" style="left:calc(10px + (100% - 20px) * {(c + 0.5) / n})"></div>{/each}
  </div>
</div>
