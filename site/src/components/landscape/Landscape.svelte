<script lang="ts">
  /* Landscape: every part as a tile, by layer. Pick a run step to light up the parts it uses; pick a tile for detail.
     The view (as built, target, evaluation) is in the URL hash. */
  import { onMount } from "svelte";
  import Icon from "../Icon.svelte";
  import type { Tile, View } from "../../data/types";

  let { VIEWS, ICON, C }: { VIEWS: Record<string, View>; ICON: Record<string, string>; C: Record<string, string> } = $props();

  const TABS = [["built", "As built"], ["target", "Target: margin recovery agent"], ["eval", "Evaluation and monitoring"]] as const;
  const LABEL: Record<string, string> = { built: "in place", part: "partly", gap: "not yet" };

  let view = $state("built");
  let step = $state<string | null>(null);
  let tile = $state<Tile | null>(null);
  const v = $derived(VIEWS[view]);

  function fromHash() { const h = location.hash.slice(1); view = h in VIEWS ? h : "built"; step = null; tile = null; }
  onMount(() => { fromHash(); window.addEventListener("hashchange", fromHash); return () => window.removeEventListener("hashchange", fromHash); });
  $effect(() => { document.body.classList.toggle("focusing", !!step); });

  const pickStep = (n: string) => { step = step === n ? null : n; tile = null; };
</script>

<header class="top"><div class="wrap">
  <h1>Retail Finance Platform Landscape</h1>
  <p class="sub">{v.sub}</p>
</div></header>

<div class="bar"><div class="wrap">
  <div class="row" role="tablist" aria-label="View">
    <span class="lbl">View</span>
    {#each TABS as [k, l]}<button class="tab" role="tab" aria-selected={k === view} onclick={() => (location.hash = k)}>{l}</button>{/each}
  </div>
  {#if v.steps}
    <div class="row" aria-label="Run steps">
      <span class="lbl">One run</span>
      {#each v.steps as [n, l]}<button class="step" aria-pressed={step === n} onclick={() => pickStep(n)}><b>{n}</b>{l}</button>{/each}
    </div>
  {/if}
  <div class="insp" aria-live="polite">
    {#if tile}
      <strong class={tile.m ? "k" : ""}>{tile.n}</strong> · {tile.c}{tile.d ? " · " + tile.d : ""}{#if tile.st.length}{" "}<span class="k">(step {tile.st.join(", ")})</span>{/if}
    {:else if step && v.steps}
      <strong>Step {step}.</strong> {v.steps[+step - 1][1]}
    {:else if view === "eval"}
      <strong>Read each row left to right:</strong> question → check → indicator.
    {:else}
      <strong>Tip:</strong> pick a step to light up the parts it uses; pick a tile for detail.
    {/if}
  </div>
  <div class="legend">{#each v.legend as [k, l]}<span><span class="dot {k}"></span>{l}</span>{/each}</div>
</div></div>

<main><div class="wrap">
  {#if v.rows}
    <div class="evwrap">
      <table class="ev">
        <thead><tr><th>Layer</th><th>The question</th><th>How we check it</th><th>Indicator · target</th><th>Today</th></tr></thead>
        <tbody>
          {#each v.rows as [layer, c, rows]}
            {#each rows as r, i}
              <tr style="--c:var({C[c]})">
                {#if i === 0}<td class="layer" rowspan={rows.length}>{layer}</td>{/if}
                <td class="q">{r[0]}</td><td class="t">{r[1]}</td><td class="i">{r[2]}</td><td><span class="dot s-{r[3]}"></span>{LABEL[r[3]]}</td>
              </tr>
            {/each}
          {/each}
        </tbody>
      </table>
    </div>
    <p class="note">SLI = what we measure (share of runs that succeed). SLO = its target (≥ 95%). KPI = the business result (drafts approved without edits).</p>
  {:else}
    {#each v.bands ?? [] as b}
      <section class="band" style="--c:var({C[b.c]})">
        <h2>{b.h}<small>{b.sm}</small></h2>
        <div class="groups">
          {#each b.g as [gh, tiles]}
            <div class="group">
              <h3>{gh}</h3>
              <div class="tiles">
                {#each tiles as t}
                  <button class="tile" class:gap={t.s === "gap"} class:on={!!step && t.st.includes(+step)} aria-current={tile === t ? "true" : undefined} onclick={() => (tile = t)}>
                    <span class="hd"><Icon k={ICON[t.n]} size={16} /><span class="n" class:mono={!!t.m}>{t.n}</span></span>
                    <span class="c">{t.c}</span>
                    {#if t.st.length}<span class="st">step {t.st.join(", ")}</span>{/if}
                    <span class="s s-{t.s}" aria-hidden="true"></span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div></main>
