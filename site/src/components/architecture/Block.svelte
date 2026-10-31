<script lang="ts">
  /* One content block of a section: picks the right piece for its type (see Block in data/types.ts). */
  import Self from "./Block.svelte";
  import Diagram from "./Diagram.svelte";
  import Sequence from "./Sequence.svelte";
  import FlipCards from "./FlipCards.svelte";
  import WhoSwitch from "./WhoSwitch.svelte";
  import Quiz from "./Quiz.svelte";
  import Chat from "./Chat.svelte";
  import SpotGame from "./SpotGame.svelte";
  import ApproveGame from "./ApproveGame.svelte";
  import type { Block, Dia } from "../../data/types";

  let { b, expertDia, plain, lld = 0, setLld }: {
    b: Block;
    expertDia?: Dia;                                // the section's expert diagram, for { dia: "from" }
    plain: (id: string) => string | undefined;      // plain-words text for a box
    lld?: number;
    setLld?: (i: number) => void;
  } = $props();

  // Blocks are a union; read them through a loose view so the template stays short.
  const x = $derived(b as Record<string, any>);
  const cell = (c: string | number) => String(c);
</script>

{#if x.dia === "from"}
  {#if expertDia}<Diagram spec={expertDia} story={x.story} {plain} />{/if}
{:else if x.dia}
  <Diagram spec={x.dia} story={x.story} {plain} />
{:else if x.big}
  <p class="big">{x.big}</p>
{:else if x.flip}
  <FlipCards cards={x.flip} />
{:else if x.who}
  <WhoSwitch w={x.who} />
{:else if x.facts}
  <div class="facts">{#each x.facts as [n, l]}<div><b>{n}</b><span>{l}</span></div>{/each}</div>
{:else if x.quiz}
  <Quiz qs={x.quiz} />
{:else if x.chat}
  <Chat msgs={x.chat} />
{:else if x.spot}
  <SpotGame sp={x.spot} />
{:else if x.approve}
  <ApproveGame ap={x.approve} />
{:else if x.q}
  <p class="q">{x.q.includes("“") ? x.q : `“${x.q}”`}</p>
{:else if x.h}
  <h3 class="bh">{x.h}</h3>
{:else if x.p}
  <p class="prose">{@html x.p}</p>
{:else if x.cards}
  <div class="cards">{#each x.cards as [t, s, c]}<div class="card" style="--c:var({c})"><b>{t}</b><span>{s}</span></div>{/each}</div>
{:else if x.kv}
  <div class="kv">{#each x.kv as [k, v]}<div><b>{k}</b>{v}</div>{/each}</div>
{:else if x.table}
  <div class="tw">
    <table class="t">
      <thead><tr>{#each x.table as h}<th>{h}</th>{/each}</tr></thead>
      <tbody>
        {#each x.rows as r}<tr>{#each r as c}<td>{#if cell(c).startsWith("<span")}{@html c}{:else}{c}{/if}</td>{/each}</tr>{/each}
      </tbody>
    </table>
  </div>
{:else if x.seq}
  <Sequence s={x.seq} />
{:else if x.lld}
  {@const cur = x.lld[lld] ?? x.lld[0]}
  <div class="picker" role="group" aria-label="Component">
    {#each x.lld as l, i}<button class="pk" aria-pressed={i === lld} onclick={() => setLld?.(i)}>{l.n}</button>{/each}
  </div>
  {#key cur}
    {#each cur.b as bb}<Self b={bb} {plain} />{/each}
  {/key}
{/if}
