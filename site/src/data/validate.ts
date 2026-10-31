/* Build-time checks on the links inside the content. Types catch a wrong shape; these catch a wrong id:
   an arrow to a box that does not exist, a story step lighting up a missing box or arrow, a plain-words text
   for a box no diagram has, a tool category without a pick. Any problem fails the build. */
import type { Arch, ArchKey, Block, Cat, Dia, Kid, KidBox, Step } from "./types";
import { ICONS, BADGES } from "../lib/icons";

const known = (k: string) => !k || k in ICONS || k in BADGES;

function diagrams(blocks: Block[], out: Dia[] = []): Dia[] {
  for (const b of blocks) {
    if ("dia" in b && b.dia !== "from") out.push(b.dia);
    if ("lld" in b) b.lld.forEach(l => diagrams(l.b, out));
  }
  return out;
}

function checkDia(where: string, d: Dia, errs: string[]) {
  const ids = new Set(d.els.map(e => e.id));
  if (ids.size !== d.els.length) errs.push(`${where}: duplicate box id`);
  for (const e of d.els) if (!known(e.ic)) errs.push(`${where}: box ${e.id} has unknown icon "${e.ic}"`);
  for (const r of d.rels) for (const id of [r.a, r.b]) if (!ids.has(id)) errs.push(`${where}: arrow ${r.a}>${r.b} points to missing box "${id}"`);
  for (const [l, row] of d.lanes ?? []) if (!d.els.some(e => e.r === row)) errs.push(`${where}: lane "${l}" has no box in row ${row}`);
  for (const [l, bs] of d.bounds ?? []) for (const id of bs) if (!ids.has(id)) errs.push(`${where}: boundary "${l}" names missing box "${id}"`);
}

function checkStory(where: string, d: Dia, story: Step[], errs: string[]) {
  const ids = new Set(d.els.map(e => e.id)), keys = new Set(d.rels.map(r => `${r.a}>${r.b}`));
  story.forEach((s, i) => {
    for (const id of s.on) if (!ids.has(id)) errs.push(`${where} step ${i + 1}: lights up missing box "${id}"`);
    for (const k of s.w ?? []) if (!keys.has(k)) errs.push(`${where} step ${i + 1}: lights up missing arrow "${k}"`);
  });
}

export function validateArchitecture(A: Record<ArchKey, Arch>, KID: Kid, KIDBOX: KidBox) {
  const errs: string[] = [];
  for (const [ak, arch] of Object.entries(A) as [ArchKey, Arch][]) {
    const all = new Set<string>();
    for (const [sk, sec] of Object.entries(arch.sections)) {
      const ds = diagrams(sec.b);
      ds.forEach((d, i) => { checkDia(`${ak}/${sk} diagram ${i + 1}`, d, errs); d.els.forEach(e => all.add(e.id)); });
      sec.b.forEach(b => { if ("dia" in b && b.dia !== "from" && b.story) checkStory(`${ak}/${sk}`, b.dia, b.story, errs); });
      const kid = KID[ak]?.[sk as keyof typeof arch.sections];
      kid?.b.forEach(b => {
        if (!("dia" in b) || b.dia !== "from") return;
        if (!ds[0]) errs.push(`${ak}/${sk} simple: "from" but the expert section has no diagram`);
        else checkStory(`${ak}/${sk} simple`, ds[0], b.story, errs);
      });
      for (const [id] of Object.entries(KIDBOX[ak]?.[sk as keyof typeof arch.sections] ?? {}))
        if (!ds.some(d => d.els.some(e => e.id === id))) errs.push(`${ak}/${sk} plain words: no box "${id}" in this section`);
    }
    for (const id of Object.keys(KIDBOX[ak]?._ ?? {})) if (!all.has(id)) errs.push(`${ak} plain words: no box "${id}" in any diagram`);
  }
  if (errs.length) throw new Error("Architecture content has broken links:\n  " + errs.join("\n  "));
}

export function validateTools(CATS: Cat[]) {
  const errs: string[] = [];
  if (new Set(CATS.map(c => c.id)).size !== CATS.length) errs.push("duplicate category id");
  for (const c of CATS) {
    if (!c.t.some(t => t.pick)) errs.push(`${c.id}: no pick`);
    if (!c.t.some(t => !t.pick)) errs.push(`${c.id}: no competitor`);
    for (const t of c.t) {
      if (!known(t.ic)) errs.push(`${c.id}: ${t.n} has unknown icon "${t.ic}"`);
      if (t.cap < 1 || t.cap > 10 || t.fit < 1 || t.fit > 10) errs.push(`${c.id}: ${t.n} score out of 1-10`);
    }
  }
  if (errs.length) throw new Error("Tool scorecard has problems:\n  " + errs.join("\n  "));
}
