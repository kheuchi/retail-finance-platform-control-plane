<script lang="ts">
  /* One scorecard per tool category: x = fit for this project, y = capability, tile size = how widely used.
     Click a logo for the reasons; the table below lists every pick at a glance. The category is in the URL hash. */
  import { onMount } from "svelte";
  import Icon from "../Icon.svelte";
  import { PICKLBL } from "../../data/tools";
  import type { Cat, Tool } from "../../data/types";

  let { CATS }: { CATS: Cat[] } = $props();

  let stage = $state<"all" | "built" | "target">("all");
  let catId = $state(CATS[0].id);
  let tool = $state(0);
  let showTable = $state(false);
  let tip = $state<{ t: Tool; x: number; y: number } | null>(null);
  let chartEl: HTMLDivElement;

  const visible = $derived(CATS.filter(c => stage === "all" || c.st === stage));
  const cat = $derived(visible.find(c => c.id === catId) ?? visible[0]);
  const cur = $derived(cat.t[tool] ?? cat.t[0]);

  function pickCat(id: string, scroll = false) {
    catId = id; tool = 0;
    try { history.replaceState(null, "", "#" + id); } catch { /* sandboxed */ }
    if (scroll) document.getElementById("ct")?.scrollIntoView({ behavior: "smooth" });
  }
  function setStage(s: typeof stage) {
    stage = s;
    if (!visible.some(c => c.id === catId)) { catId = visible[0].id; tool = 0; }
  }
  onMount(() => { const h = location.hash.slice(1); if (CATS.some(c => c.id === h)) catId = h; });

  // plot area in percent of the box; scores 1-10 map onto it
  const L = 9, Rr = 97, Tp = 4, B = 90;
  const X = (v: number) => L + (v - 1) / 9 * (Rr - L), Y = (v: number) => B - (v - 1) / 9 * (B - Tp);
  const ticks = [1, 4, 7, 10];

  const points = $derived.by(() => {
    const seen: Record<string, number> = {};
    return cat.t.map((t, i) => {
      const k = (seen[t.cap + "," + t.fit] = (seen[t.cap + "," + t.fit] ?? 0) + 1);   // spread tools that share a spot
      const near = (d: number) => cat.t.some(o => o !== t && Math.abs(o.cap - t.cap) <= 0.5 && d * (o.fit - t.fit) > 0 && Math.abs(o.fit - t.fit) <= 3);
      const side = t.fit >= 8 || near(1) ? (near(-1) ? "below" : "left") : "right";   // name label away from neighbours
      return { t, i, side, size: [0, 26, 32, 38][t.ad], x: X(t.fit), y: Y(t.cap) + (k - 1) * 9 };
    });
  });

  function hover(ev: MouseEvent, t: Tool) {
    const tile = (ev.currentTarget as HTMLElement).querySelector(".tile")!.getBoundingClientRect(), box = chartEl.getBoundingClientRect();
    tip = { t, x: tile.left + tile.width / 2 - box.left, y: tile.top - box.top };
  }

  const firstPick = (c: Cat) => c.t.find(t => t.pick)!;
  const summary = $derived(CATS.map(c => {
    const picks = c.t.filter(t => t.pick), main = picks.find(t => t.pick !== "pick") ?? picks[0];
    const alt = c.t.filter(t => !t.pick).sort((a, b) => b.cap + b.fit - (a.cap + a.fit))[0];
    return { c, picks, alt, why: main.why.split(/(?<=\.)\s/)[0] };
  }));
</script>

<div class="filters">
  <div class="seg" role="group" aria-label="Which platform">
    {#each [["all", "All"], ["built", "As built"], ["target", "Enterprise target"]] as const as [k, l]}
      <button aria-pressed={k === stage} onclick={() => setStage(k)}>{l}</button>
    {/each}
  </div>
  <div class="chips" role="group" aria-label="Tool category">
    {#each visible as c}
      <button class="chip" aria-pressed={c.id === cat.id} onclick={() => pickCat(c.id)}>
        <Icon k={firstPick(c).ic} size={16} />{c.n}{#if c.st === "target"}{" "}<span class="st">target</span>{/if}
      </button>
    {/each}
  </div>
</div>

<div class="grid">
  <section class="panel" aria-labelledby="ct">
    <h2 id="ct">{cat.n}</h2>
    <div class="kid"><b>In plain words</b>{cat.kid}</div>
    <div class="chart" bind:this={chartEl} role="img" aria-label="{cat.n}: {cat.t.length} tools scored on capability and fit" onmouseleave={() => (tip = null)}>
      <svg aria-hidden="true">
        {#each ticks as v}
          <line class="ax" x1="{L}%" x2="{Rr}%" y1="{Y(v)}%" y2="{Y(v)}%" opacity=".55" /><text class="tick" x="{L - 1.5}%" y="{Y(v)}%" dy="4" text-anchor="end">{v}</text>
          <line class="ax" y1="{Tp}%" y2="{B}%" x1="{X(v)}%" x2="{X(v)}%" opacity=".55" /><text class="tick" y="{B + 4.5}%" x="{X(v)}%" text-anchor="middle">{v}</text>
        {/each}
        <line class="mid" x1="{X(5.5)}%" x2="{X(5.5)}%" y1="{Tp}%" y2="{B}%" /><line class="mid" x1="{L}%" x2="{Rr}%" y1="{Y(5.5)}%" y2="{Y(5.5)}%" />
        <text class="quad" x="{L + 1.5}%" y="{Tp + 3}%">Powerful, poor fit here</text><text class="quad" x="{Rr - 1.5}%" y="{Tp + 3}%" text-anchor="end">Best for us</text>
        <text class="quad" x="{L + 1.5}%" y="{B - 2}%">Not for us</text><text class="quad" x="{Rr - 1.5}%" y="{B - 2}%" text-anchor="end">Fits, but limited</text>
        <text class="axl" x="{(L + Rr) / 2}%" y="99%" text-anchor="middle">Fit for this project →</text>
      </svg>
      <span class="ylab" style="top:{(Tp + B) / 2}%">Capability →</span>
      {#each points as p (p.t.n)}
        <button class="pt {p.side} {p.t.pick === 'pick' ? 'pick' : p.t.pick ? 'target' : ''}" aria-pressed={p.i === tool} style="left:{p.x}%;top:{p.y}%"
          aria-label="{p.t.n}: capability {p.t.cap}, fit {p.t.fit}" onclick={() => (tool = p.i)} onmouseenter={ev => hover(ev, p.t)} onmouseleave={() => (tip = null)}>
          <span class="tile" style="width:{p.size}px;height:{p.size}px"><Icon k={p.t.ic} size={Math.round(p.size * 0.58)} /></span><span class="nm">{p.t.n}</span>
        </button>
      {/each}
      {#if tip}
        <div class="tip" style="left:{tip.x}px;top:{tip.y}px"><b>{tip.t.n}</b><br />Capability {tip.t.cap} · Fit {tip.t.fit}{tip.t.pick ? " · " + PICKLBL[tip.t.pick] : ""}</div>
      {/if}
    </div>
    <div class="legend">
      <span><span class="sw" style="border:3px solid var(--ok)"></span>Our pick (built)</span>
      <span><span class="sw" style="border:3px solid var(--rev)"></span>Planned or target pick</span>
      <span><span class="sw" style="border:1.5px solid var(--line)"></span>Competitor</span>
      <span>Bigger tile = more widely used</span>
    </div>
    <button class="link" aria-expanded={showTable} onclick={() => (showTable = !showTable)}>{showTable ? "Hide the table" : "Show this chart as a table"}</button>
    {#if showTable}
      <div class="tw">
        <table class="t">
          <thead><tr><th>Tool</th><th>Capability</th><th>Fit for us</th><th>Status</th></tr></thead>
          <tbody>
            {#each cat.t as t}<tr><td><span class="cell"><Icon k={t.ic} size={16} />{t.n}</span></td><td>{t.cap}</td><td>{t.fit}</td><td>{PICKLBL[t.pick] || "Competitor"}</td></tr>{/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <aside class="panel" aria-live="polite">
    <div class="det">
      <div class="hd"><Icon k={cur.ic} size={30} /><b>{cur.n}</b><span class="tag {cur.pick}">{cur.pick ? PICKLBL[cur.pick] : "Competitor"}</span></div>
      <p style="margin:0">{cur.why}</p>
      <div class="bars">
        <span>Capability</span><span class="tr"><i style="width:{cur.cap * 10}%"></i></span><span class="v">{cur.cap}/10</span>
        <span>Fit for us</span><span class="tr"><i style="width:{cur.fit * 10}%"></i></span><span class="v">{cur.fit}/10</span>
        <span>How widely used</span><span class="tr"><i style="width:{cur.ad * 33.3}%"></i></span><span class="v">{["", "niche", "growing", "widespread"][cur.ad]}</span>
      </div>
      <h3>Others in {cat.n.toLowerCase()}</h3>
      <div class="chips">
        {#each cat.t as o, i}{#if i !== tool}<button class="chip" onclick={() => (tool = i)}><Icon k={o.ic} size={16} />{o.n}</button>{/if}{/each}
      </div>
    </div>
  </aside>
</div>

<h3>Every pick at a glance</h3>
<div class="tw">
  <table class="t">
    <thead><tr><th>Category</th><th>Platform</th><th>Our pick</th><th>Strongest alternative</th><th>Why ours</th></tr></thead>
    <tbody>
      {#each summary as r}
        <tr data-cat={r.c.id} onclick={() => { setStage("all"); pickCat(r.c.id, true); }}>
          <td>{r.c.n}</td><td>{r.c.st === "target" ? "Target" : "As built"}</td>
          <td><span class="cell">{#each r.picks as t, i}{#if i}{" · "}{/if}<Icon k={t.ic} size={16} />{t.n}{#if t.pick !== "pick"}{" "}<span class="tag {t.pick}">{PICKLBL[t.pick]}</span>{/if}{/each}</span></td>
          <td><span class="cell"><Icon k={r.alt.ic} size={16} />{r.alt.n}</span></td>
          <td>{r.why}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
