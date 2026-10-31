<script lang="ts">
  /* Architecture page: two architectures (tabs) × ten sections, in Simple (sections 1-4 for everyone) or Expert mode.
     State lives in the URL hash (#arch-section[-lld]) so every view can be linked; the mode is remembered per reader. */
  import { onMount } from "svelte";
  import Block from "./Block.svelte";
  import type { Arch, ArchKey, Dia, Kid, KidBox, SecKey } from "../../data/types";

  let { A, KID, KIDBOX }: { A: Record<ArchKey, Arch>; KID: Kid; KIDBOX: KidBox } = $props();

  const SECS: [SecKey, string][] = [["big", "Big picture"], ["flow", "Business workflow"], ["simple", "Simplified"], ["hld", "HLD"], ["lld", "LLDs"],
    ["net", "Network & protocols"], ["obs", "Observability"], ["eval", "Evaluation"], ["sec", "Security"], ["more", "Cost & decisions"]];
  const SIMPLE = new Set<SecKey>(["big", "flow", "simple", "hld"]);
  const MODES = [["simple", "Simple: for everyone"], ["expert", "Expert: for engineers"]] as const;

  let arch = $state<ArchKey>("built");
  let sec = $state<SecKey>("big");
  let lld = $state(0);
  let mode = $state<"simple" | "expert">("simple");

  const s = $derived(A[arch].sections[sec]);
  const kid = $derived(mode === "simple" ? KID[arch]?.[sec] : undefined);
  const blocks = $derived(kid ? kid.b : s.b);
  const expertDia = $derived(s.b.find((b): b is { dia: Dia } => "dia" in b && b.dia !== "from")?.dia);
  const plain = (id: string) => KIDBOX[arch]?.[sec]?.[id] ?? KIDBOX[arch]?._?.[id];

  const go = (a: ArchKey, s: SecKey, l?: number) => { location.hash = `${a}-${s}${l ? "-" + l : ""}`; };
  function fromHash() {
    const [a, s, l] = location.hash.slice(1).split("-");
    arch = a in A ? (a as ArchKey) : "built";
    sec = SECS.some(([k]) => k === s) ? (s as SecKey) : "big";
    lld = +l || 0;
  }
  function setMode(m: "simple" | "expert") {
    mode = m;
    try { localStorage.setItem("rfp-mode", m); } catch { /* private window: not remembered */ }
  }

  onMount(() => {
    try { mode = localStorage.getItem("rfp-mode") === "expert" ? "expert" : "simple"; } catch { /* default */ }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  });
</script>

<div class="bar"><div class="wrap">
  <div class="row">
    <div class="row" role="tablist" aria-label="Architecture">
      {#each Object.entries(A) as [k, v]}
        <button class="arch" role="tab" aria-selected={k === arch} onclick={() => go(k as ArchKey, sec)}>{v.name}</button>
      {/each}
    </div>
    <div class="modes" role="group" aria-label="Explanation level">
      {#each MODES as [k, l]}<button aria-pressed={k === mode} onclick={() => setMode(k)}>{l}</button>{/each}
    </div>
  </div>
  <div class="row" role="tablist" aria-label="Section">
    {#each SECS as [k, l], i}
      <button class="sec" role="tab" aria-selected={k === sec} onclick={() => go(arch, k)}><b>{i + 1}</b>{l}</button>
    {/each}
  </div>
</div></div>

<main><div class="wrap">
  {#key `${arch}-${sec}-${mode}`}
    <div class="sh"><h2>{kid ? kid.t : s.t}</h2><p>{kid ? kid.d : s.d}</p></div>
    {#if !kid && mode === "simple"}
      <p class="hint">This section is the engineers' detail; the simple version covers sections 1 to 4. Tap any box in a diagram to see what it is.</p>
    {:else if !kid && SIMPLE.has(sec)}
      <p class="hint">New to data and AI? <button class="link" onclick={() => setMode("simple")}>Switch to the simple version</button>, with a story you can play.</p>
    {/if}
    {#each blocks as b}
      <Block {b} {expertDia} {plain} {lld} setLld={i => go(arch, sec, i)} />
    {/each}
    {#if kid}
      <p class="hint">Want the real names, protocols and tables? <button class="link" onclick={() => setMode("expert")}>See the expert version of this section</button></p>
    {/if}
  {/key}
</div></main>
