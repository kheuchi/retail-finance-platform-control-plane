/* Search index, built at build time from the same data files as the pages (served as search.json).
   One entry per view a reader can land on: architecture section × mode (and each LLD), landscape tile, tool category. */
import { built } from "../data/architecture/built";
import { target } from "../data/architecture/target";
import { KID, KIDBOX } from "../data/architecture/simple";
import { VIEWS } from "../data/landscape";
import { CATS } from "../data/tools";
import type { Arch, ArchKey, Block, SecKey } from "../data/types";
import { url } from "./url";

/** t: title · p: where it is · x: searchable text · h: link · m: architecture mode to open it in · k: names that rank like a title */
export interface Hit { t: string; p: string; x: string; h: string; m?: "simple" | "expert"; k?: string }

const SECS: [SecKey, string][] = [["big", "Big picture"], ["flow", "Business workflow"], ["simple", "Simplified"], ["hld", "HLD"], ["lld", "LLDs"],
  ["net", "Network & protocols"], ["obs", "Observability"], ["eval", "Evaluation"], ["sec", "Security"], ["more", "Cost & decisions"]];
const VIEW_NAMES: Record<string, string> = { built: "As built", target: "Target", eval: "Evaluation and monitoring" };

const clean = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();

/** Every readable string in a block (LLD sub-pages are indexed separately). */
function words(b: Block): string[] {
  if ("q" in b) return [b.q];
  if ("h" in b) return [b.h];
  if ("p" in b) return [b.p];
  if ("big" in b) return [b.big];
  if ("cards" in b) return b.cards.flatMap(([t, x]) => [t, x]);
  if ("kv" in b) return b.kv.flat();
  if ("table" in b) return [...b.table, ...b.rows.flat().map(String)];
  if ("dia" in b) {
    const st = (b.story ?? []).flatMap(s => [s.t, s.s, s.why ?? ""]);
    return b.dia === "from" ? st : [...b.dia.els.flatMap(e => [e.n, e.d]), ...b.dia.rels.map(r => r.w), ...st];
  }
  if ("seq" in b) return [...b.seq.ps.map(p => p.n), ...b.seq.ms.flatMap(m => [m.l, m.p ?? ""])];
  if ("flip" in b) return b.flip.flatMap(([f, n, t]) => [f, n, t]);
  if ("who" in b) return [...b.who.modes, ...b.who.tasks.flatMap(([t, , , w]) => [t, w])];
  if ("facts" in b) return b.facts.flat();
  if ("quiz" in b) return b.quiz.flatMap(([q, o, , w]) => [q, ...o, w]);
  if ("chat" in b) return b.chat.flatMap(([, tool, t]) => [tool, t]);
  if ("spot" in b) return [b.spot.intro, ...b.spot.parts.map(p => typeof p === "string" ? p : p[0]), b.spot.caught, b.spot.limit];
  if ("approve" in b) return [b.approve.draft, ...b.approve.yes, ...b.approve.no];
  return [];
}
const text = (bs: Block[], extra: string[] = []) => clean([...bs.flatMap(words), ...extra].filter(Boolean).join(" · "));

export function buildIndex(): Hit[] {
  const out: Hit[] = [];
  const A: Record<ArchKey, Arch> = { built, target };
  const page = url("architecture/architecture.html");
  for (const a of ["built", "target"] as ArchKey[]) {
    SECS.forEach(([k, label], i) => {
      const s = A[a].sections[k], where = `Architecture · ${A[a].name} · ${i + 1} ${label}`;
      const lld = s.b.find(b => "lld" in b);
      if (lld && "lld" in lld)
        lld.lld.forEach((l, j) => out.push({ t: `${s.t}: ${l.n}`, p: `${where} · Expert`, x: text(l.b), h: `${page}#${a}-${k}-${j}`, m: "expert" }));
      else out.push({ t: s.t, p: `${where} · Expert`, x: text(s.b), h: `${page}#${a}-${k}`, m: "expert" });
      const kid = KID[a]?.[k];
      if (kid) {
        const boxes = k === "hld" ? Object.values(KIDBOX[a]?._ ?? {}) : Object.values(KIDBOX[a]?.[k] ?? {});
        out.push({ t: kid.t, p: `${where} · Simple`, x: text(kid.b, [kid.d, ...boxes]), h: `${page}#${a}-${k}`, m: "simple" });
      }
    });
  }
  for (const [v, view] of Object.entries(VIEWS)) {
    const h = `${url("landscape/platform-landscape.html")}#${v}`, where = `Landscape · ${VIEW_NAMES[v] ?? v}`;
    for (const band of view.bands ?? []) for (const [group, tiles] of band.g) for (const tile of tiles)
      out.push({ t: tile.n, p: `${where} · ${band.h} · ${group}`, x: clean(`${tile.c} · ${tile.d}`), h });
    for (const [layer, , rows] of view.rows ?? [])
      out.push({ t: layer, p: where, x: clean(rows.flat().join(" · ")), h });
  }
  for (const c of CATS)
    out.push({ t: c.n, p: `Tools · ${c.st === "built" ? "As built" : "Target"}`, x: clean([c.kid, ...c.t.flatMap(t => [t.n, t.why])].join(" · ")), h: `${url("landscape/tools.html")}#${c.id}`, k: c.t.map(t => t.n).join(" · ") });
  return out;
}
