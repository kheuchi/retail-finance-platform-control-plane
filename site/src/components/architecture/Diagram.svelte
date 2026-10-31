<script lang="ts">
  /* Box diagram: boxes sit on a CSS grid, arrows are drawn from the real box positions after layout.
     Optional story player (steps light up boxes and make the data move along arrows); tapping a box
     shows what it is, in plain words, and what it gets from and gives to. */
  import { onMount } from "svelte";
  import Icon from "../Icon.svelte";
  import { LY } from "../../data/architecture/helpers";
  import type { Dia, Rel, Step } from "../../data/types";

  let { spec, story, plain }: { spec: Dia; story?: Step[]; plain: (id: string) => string | undefined } = $props();

  const uid = $props.id();
  type Box = { l: number; t: number; r: number; b: number; w: number; h: number; cx: number; cy: number };
  type Wires = {
    paths: { k: string; d: string; dash: boolean; both: boolean }[];
    labels: { k: string; x: number; y: number; w: string }[];
    bounds: { label: string; c: string; icon?: string; l: number; t: number; w: number; h: number }[];
  };

  let stage: HTMLDivElement;
  let wires = $state<Wires | null>(null);
  let hl = $state<{ on: Set<string>; w: Set<string>; sel?: string } | null>(null);
  let step = $state(-1);
  let timer: ReturnType<typeof setInterval> | null = null;
  let playing = $state(false);
  let info = $state<string | null>(null);

  const key = (r: Rel) => `${r.a}>${r.b}`;
  const minWidth = $derived(spec.cols * 170 + (spec.cols - 1) * 96 + 52);

  function box(id: string, s: DOMRect): Box {
    const r = stage.querySelector(`[data-id="${id}"]`)!.getBoundingClientRect();
    return { l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top, w: r.width, h: r.height, cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2 };
  }

  /** Orthogonal route between two boxes: h, v, hv, vh or u (under both). */
  function route(A: Box, B: Box, rt: Rel["rt"], e?: number, f?: number, m = 0.5): number[][] {
    const ax = e != null ? A.l + A.w * e : A.cx, bx = f != null ? B.l + B.w * f : B.cx;
    if (rt === "h") {
      const right = B.l > A.r, x1 = right ? A.r : A.l, x2 = right ? B.l : B.r, lo = Math.max(A.t, B.t), hi = Math.min(A.b, B.b);
      if (hi - lo > 14) { const y = (lo + hi) / 2; return [[x1, y], [x2, y]]; }
      const xm = (x1 + x2) / 2; return [[x1, A.cy], [xm, A.cy], [xm, B.cy], [x2, B.cy]];
    }
    if (rt === "v") {
      const down = B.t > A.b, y1 = down ? A.b : A.t, y2 = down ? B.t : B.b, lo = Math.max(A.l, B.l), hi = Math.min(A.r, B.r);
      if (e == null && f == null && hi - lo > 14) { const x = (lo + hi) / 2; return [[x, y1], [x, y2]]; }
      const ym = y1 + (y2 - y1) * m; return [[ax, y1], [ax, ym], [bx, ym], [bx, y2]];
    }
    if (rt === "hv") { const right = bx > A.cx, x1 = right ? A.r : A.l, down = B.cy > A.cy; return [[x1, A.cy], [bx, A.cy], [bx, down ? B.t : B.b]]; }
    if (rt === "vh") { const down = B.cy > A.cy, right = B.cx > ax; return [[ax, down ? A.b : A.t], [ax, B.cy], [right ? B.l : B.r, B.cy]]; }
    const y = Math.max(A.b, B.b) + 22; return [[ax, A.b], [ax, y], [bx, y], [bx, B.b]];
  }

  function draw() {
    if (!stage || getComputedStyle(stage).display !== "grid") { wires = null; return; }   // phone: stacked boxes, no wires
    const s = stage.getBoundingClientRect(), w: Wires = { paths: [], labels: [], bounds: [] };
    for (const [label, row, c] of spec.lanes ?? []) {
      const bs = spec.els.filter(e => e.r === row).map(e => box(e.id, s)); if (!bs.length) continue;
      const t = Math.min(...bs.map(b => b.t)) - 28, b = Math.max(...bs.map(b => b.b)) + 12;
      w.bounds.push({ label, c, l: 10, t, w: s.width - 20, h: b - t });
    }
    for (const [label, ids, c, icon] of spec.bounds ?? []) {
      const bs = ids.map(id => box(id, s)), p = 13;
      const l = Math.min(...bs.map(b => b.l)) - p, t = Math.min(...bs.map(b => b.t)) - p - 18, r = Math.max(...bs.map(b => b.r)) + p, b = Math.max(...bs.map(b => b.b)) + p;
      w.bounds.push({ label, c, icon, l, t, w: r - l, h: b - t });
    }
    for (const r of spec.rels) {
      const pts = route(box(r.a, s), box(r.b, s), r.rt, r.e, r.f, r.m);
      w.paths.push({ k: key(r), d: "M" + pts.map(p => p.join(" ")).join(" L"), dash: !!r.dash, both: !!r.both });
      if (!r.w) continue;
      let best = 0, x = 0, y = 0;   // label on the longest segment
      for (let i = 1; i < pts.length; i++) {
        const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (len > best) { best = len; x = (pts[i][0] + pts[i - 1][0]) / 2; y = (pts[i][1] + pts[i - 1][1]) / 2; }
      }
      w.labels.push({ k: key(r), x, y, w: r.w });
    }
    wires = w;
  }

  onMount(() => {
    draw();
    let rt: ReturnType<typeof setTimeout>;
    const redraw = () => { clearTimeout(rt); rt = setTimeout(draw, 120); };
    window.addEventListener("resize", redraw);
    document.fonts?.ready.then(draw);
    return () => { window.removeEventListener("resize", redraw); stopPlay(); };
  });

  /* ---------- story player ---------- */
  function setStep(i: number) {
    if (!story) return;
    i = Math.max(0, Math.min(story.length - 1, i));
    step = i;
    const s = story[i], on = new Set(s.on);
    hl = { on, w: new Set(s.w ?? spec.rels.filter(r => on.has(r.a) && on.has(r.b)).map(key)) };
    info = null;
  }
  function stopPlay() { if (timer) clearInterval(timer); timer = null; playing = false; }
  function play() {
    if (!story) return;
    if (playing) return stopPlay();
    if (step < 0 || step >= story.length - 1) setStep(0);
    playing = true;
    timer = setInterval(() => { if (step >= story!.length - 1) return stopPlay(); setStep(step + 1); }, 4200);
  }
  const go = (i: number) => { stopPlay(); setStep(i); };

  /* ---------- tap a box ---------- */
  const other = (r: Rel, id: string) => (r.a === id ? r.b : r.a);
  const name = (id: string) => spec.els.find(e => e.id === id)?.n ?? id;
  function tap(id: string) {
    stopPlay();
    if (hl?.sel === id) { hl = null; info = null; return; }
    const rs = spec.rels.filter(r => r.a === id || r.b === id);
    hl = { on: new Set([id, ...rs.map(r => other(r, id))]), w: new Set(rs.map(key)), sel: id };
    info = id;
  }
  const close = () => { hl = null; info = null; };
  const sel = $derived(info ? spec.els.find(e => e.id === info) : undefined);
  const ins = $derived(info ? spec.rels.filter(r => r.b === info || (r.both && r.a === info)) : []);
  const outs = $derived(info ? spec.rels.filter(r => r.a === info || (r.both && r.b === info)) : []);
  const text = $derived(info ? plain(info) : undefined);

  const cls = (e: Dia["els"][number]) =>
    ["el", e.k === "person" && "person", e.k === "ext" && "ext", e.k === "db" && "db", typeof e.r === "string" && "tall", e.x, hl?.on.has(e.id) && "on"].filter(Boolean).join(" ");
  const col = (e: Dia["els"][number]) => (e.k === "ext" && e.x !== "gap" ? "" : `--c:var(${LY[e.ly]});`);
</script>

{#if story}
  <div class="story">
    <div class="cap">
      {#if step < 0}
        <span class="n">Press Play, or tap any box</span><b>{story.length} steps</b><p>Each step lights up who is involved and makes the data move along the arrows.</p>
      {:else}
        <span class="n">Step {step + 1} of {story.length}</span><b>{story[step].t}</b><p>{story[step].s}</p>
      {/if}
    </div>
    <div class="btns">
      <button class="btn ghost" aria-label="Previous step" onclick={() => go(step - 1)}>◀</button>
      <button class="btn" onclick={play}>{playing ? "❚❚ Pause" : "▶ Play"}</button>
      <button class="btn ghost" aria-label="Next step" onclick={() => go(step + 1)}>▶</button>
      <span class="dots">
        {#each story as _, i}<button aria-label="Step {i + 1}" aria-current={i === step} onclick={() => go(i)}></button>{/each}
      </span>
    </div>
  </div>
{/if}

<div class="scroll">
  <div class="stage" class:hl={!!hl} bind:this={stage} style="grid-template-columns:repeat({spec.cols}, minmax(0, 1fr));min-width:{minWidth}px">
    {#if wires}
      <svg class="wires" aria-hidden="true">
        <defs>
          <marker id="ah-{uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" /></marker>
          <marker id="ah2-{uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--agent)" /></marker>
        </defs>
        {#each wires.paths as p}
          {@const on = !!hl?.w.has(p.k)}
          <path data-k={p.k} class:dash={p.dash} class:on d={p.d} marker-start={p.both ? `url(#ah-${uid})` : undefined} marker-end={on ? `url(#ah2-${uid})` : `url(#ah-${uid})`} />
        {/each}
      </svg>
    {/if}
    {#each spec.els as e (e.id)}
      <div class={cls(e)} data-id={e.id} style="{col(e)}grid-column:{e.c} / span {e.cs};grid-row:{e.r}" role="button" tabindex="0"
        onclick={() => tap(e.id)} onkeydown={ev => (ev.key === "Enter" || ev.key === " ") && (ev.preventDefault(), tap(e.id))}>
        <div class="hd"><Icon k={e.ic} size={17} /><span>{e.n}</span></div>
        {#if e.d}<div class="d">{e.d}</div>{/if}
      </div>
    {/each}
    {#if wires}
      {#each wires.bounds as b}
        <div class="bound" style="--c:var({b.c});left:{b.l}px;top:{b.t}px;width:{b.w}px;height:{b.h}px"><span><Icon k={b.icon} size={14} />{b.label}</span></div>
      {/each}
      {#each wires.labels as l}
        <div class="wl" class:on={!!hl?.w.has(l.k)} data-k={l.k} style="left:{l.x}px;top:{l.y}px">{l.w}</div>
      {/each}
    {/if}
  </div>
</div>

{#if sel}
  <div class="info" style="--c:var({LY[sel.ly] ?? '--ext'})">
    <div class="hd"><Icon k={sel.ic} size={20} /><span>{sel.n}</span><button class="link" onclick={close}>Close</button></div>
    <p>{text || sel.d || ""}</p>
    {#if text && sel.d}<p class="note">{sel.d}</p>{/if}
    {#if ins.length}
      <b class="lbl">Gets from</b>
      <ul>{#each ins as r}<li>{name(other(r, sel.id))}{#if r.w}{" "}<i>({r.w})</i>{/if}</li>{/each}</ul>
    {/if}
    {#if outs.length}
      <b class="lbl">Gives to</b>
      <ul>{#each outs as r}<li>{name(other(r, sel.id))}{#if r.w}{" "}<i>({r.w})</i>{/if}</li>{/each}</ul>
    {/if}
  </div>
{/if}
