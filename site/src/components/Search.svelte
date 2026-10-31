<script lang="ts">
  /* Search box in the nav. Loads search.json on first focus, matches every word typed (title hits rank first),
     shows the best 8 with the matching words highlighted. "/" focuses it; arrows and Enter pick; Esc closes.
     Architecture hits also switch the page to the mode (Simple / Expert) the text belongs to. */
  import type { Hit } from "../lib/search";

  let { src }: { src: string } = $props();

  let index = $state<Hit[] | null>(null);
  let q = $state("");
  let open = $state(false);
  let cur = $state(0);
  let input: HTMLInputElement;
  let loading: Promise<void> | null = null;

  const load = () => (loading ??= fetch(src).then(r => r.json()).then(d => { index = d; }).catch(() => { index = []; }));

  const terms = $derived(q.toLowerCase().split(/\s+/).filter(t => t.length > 1));
  const hits = $derived.by(() => {
    if (!index || !terms.length) return [];
    const scored: [number, Hit][] = [];
    for (const h of index) {
      const t = h.t.toLowerCase(), k = (h.k ?? "").toLowerCase(), all = `${t} ${k} ${h.p.toLowerCase()} ${h.x.toLowerCase()}`;
      if (!terms.every(w => all.includes(w))) continue;
      scored.push([terms.reduce((n, w) => n + (t.includes(w) ? 20 : k.includes(w) ? 12 : 0) + Math.min(5, all.split(w).length - 1), 0), h]);
    }
    return scored.sort((a, b) => b[0] - a[0]).slice(0, 8).map(([, h]) => h);
  });

  const esc = (w: string) => w.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&");

  /** About 140 characters around the first match, cut into plain and highlighted parts (no HTML injected). */
  function snippet(x: string): { s: string; m: boolean }[] {
    const lx = x.toLowerCase(), at = Math.min(...terms.map(w => lx.indexOf(w)).filter(i => i >= 0), x.length);
    const from = Math.max(0, at - 50), cut = (from ? "…" : "") + x.slice(from, from + 140) + (from + 140 < x.length ? "…" : "");
    const re = new RegExp(`(${terms.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return cut.split(re).filter(Boolean).map(s => ({ s, m: terms.includes(s.toLowerCase()) }));
  }

  function choose(h: Hit) {
    if (h.m) {
      try { localStorage.setItem("rfp-mode", h.m); } catch { /* private window */ }
      window.dispatchEvent(new CustomEvent("rfp-mode", { detail: h.m }));
    }
    open = false; q = ""; input.blur();
    if (new URL(h.h, location.href).pathname === location.pathname) window.scrollTo(0, 0);
  }

  function key(e: KeyboardEvent) {
    if (e.key === "ArrowDown") { cur = Math.min(cur + 1, hits.length - 1); e.preventDefault(); }
    else if (e.key === "ArrowUp") { cur = Math.max(cur - 1, 0); e.preventDefault(); }
    else if (e.key === "Enter" && hits[cur]) { const h = hits[cur]; choose(h); location.href = h.h; }
    else if (e.key === "Escape") { open = false; input.blur(); }
  }

  function globalKey(e: KeyboardEvent) {
    const el = e.target as HTMLElement;
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !el.isContentEditable) { e.preventDefault(); input.focus(); }
  }
</script>

<svelte:window onkeydown={globalKey} />

<div class="search" role="search">
  <input bind:this={input} bind:value={q} type="search" placeholder="Search the platform  /" aria-label="Search the site"
    aria-expanded={open && terms.length > 0} aria-controls="search-results" autocomplete="off"
    onfocus={() => { load(); open = true; }} oninput={() => { open = true; cur = 0; }} onkeydown={key}
    onblur={() => setTimeout(() => (open = false), 150)} />
  {#if open && terms.length}
    <div class="res" id="search-results">
      {#if !index}<p class="none">Loading…</p>
      {:else if !hits.length}<p class="none">Nothing found for “{q}”. Try fewer or shorter words.</p>
      {:else}
        {#each hits as h, i}
          <a href={h.h} class:cur={i === cur} onmouseenter={() => (cur = i)} onclick={() => choose(h)}>
            <b>{h.t}</b><span class="p">{h.p}</span>
            <span class="x">{#each snippet(h.x) as part}{#if part.m}<mark>{part.s}</mark>{:else}{part.s}{/if}{/each}</span>
          </a>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .search { position: relative; margin-left: auto; flex: 1 1 200px; max-width: 340px }
  input { width: 100%; font: 13px var(--f-body); color: var(--paper); background: color-mix(in srgb, var(--paper) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--paper) 30%, transparent); border-radius: 6px; padding: 5px 10px }
  input::placeholder { color: color-mix(in srgb, var(--paper) 65%, transparent) }
  input:focus { outline: 2px solid var(--focus); outline-offset: 1px }
  .res { position: absolute; right: 0; top: calc(100% + 6px); width: min(560px, calc(100vw - 32px)); max-height: 70vh; overflow: auto; z-index: 100;
    background: var(--paper); color: var(--ink); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 10px 30px rgb(0 0 0 / .25); padding: 4px }
  .res a { display: grid; gap: 2px; padding: 8px 10px; border-radius: 7px; color: var(--ink); text-decoration: none; opacity: 1; border-bottom: 0; font-size: 13px }   /* beats nav.site a */
  .res a.cur { background: color-mix(in srgb, var(--focus) var(--tint), transparent) }
  b { font: 600 14px var(--f-display) }
  .p { font: 500 11px var(--f-mono); color: var(--muted) }
  .x { font-size: 12.5px; color: var(--muted) }
  mark { background: color-mix(in srgb, var(--part) 30%, transparent); color: var(--ink); border-radius: 2px }
  .none { margin: 0; padding: 10px; color: var(--muted) }
</style>
