/* Shapes of the site content. The data files are checked against these at build time (astro check),
   and src/data/validate.ts checks the links between them (arrow ends, story boxes, plain-words texts). */

export type Layer = "person" | "people" | "agent" | "gate" | "data" | "ml" | "know" | "base" | "google" | "aws" | "dbx";
export type CssVar = `--${string}`;

/* ---------- architecture diagrams ---------- */
export interface El {
  id: string;
  k: "person" | "ext" | "cont" | "db";
  n: string;            // name
  d: string;            // one-line description
  ic: string;           // icon key (src/lib/icons.ts)
  c: number;            // grid column
  r: number | string;   // grid row, or "1 / span 3" for a tall box
  cs: number;           // column span
  ly: Layer;
  x: "" | "focus" | "gap";
}
export interface Rel {
  a: string; b: string;           // from, to (box ids)
  w: string;                      // label on the arrow
  rt: "h" | "v" | "hv" | "vh" | "u";
  e?: number; f?: number; m?: number;   // where the arrow leaves / enters (0-1 of the width), bend point
  dash?: number | boolean;
  both?: number | boolean;
}
export interface Dia {
  cols: number;
  els: El[];
  rels: Rel[];
  lanes?: [label: string, row: number, color: CssVar][];
  bounds?: [label: string, ids: string[], color: CssVar, icon?: string][];
}
export interface Step { on: string[]; w?: string[]; t: string; s: string }

export interface Part { id: string; n: string; ic: string; ly: Layer }
export interface Msg { a: string; b: string; l: string; p?: string; back: number }
export interface Seq { ps: Part[]; ms: Msg[] }

/* ---------- blocks: one entry per thing shown in a section ---------- */
export type Block =
  | { q: string }
  | { h: string }
  | { p: string }                                         // may hold <b>, <code>
  | { cards: [title: string, text: string, color: CssVar][] }
  | { kv: [key: string, value: string][] }
  | { table: string[]; rows: (string | number)[][] }      // a cell starting with <span is HTML
  | { dia: Dia; story?: Step[] }
  | { dia: "from"; story: Step[] }                        // simple mode: reuse the section's expert diagram
  | { seq: Seq }
  | { lld: { n: string; b: Block[] }[] }
  | { big: string }
  | { flip: [front: string, name: string, text: string, icon: string, color: CssVar][] }
  | { who: Who }
  | { facts: [figure: string, label: string][] }
  | { quiz: [question: string, options: string[], right: number, why: string][] }
  | { chat: [who: "ctl" | "code" | "agent" | "tool", tool: string, text: string][] }
  | { spot: Spot }
  | { approve: Approve };

export interface Who {
  modes: string[];
  cols: [name: string, color: CssVar][];
  tasks: [task: string, before: number, after: number, why: string][];
}
export interface Spot { intro: string; parts: (string | [text: string, source: string])[]; caught: string; limit: string }
export interface Approve { draft: string; yes: string[]; no: string[] }

export interface Section { t: string; d: string; b: Block[] }
export type SecKey = "big" | "flow" | "simple" | "hld" | "lld" | "net" | "obs" | "eval" | "sec" | "more";
export interface Arch { name: string; sections: Record<SecKey, Section> }
export type ArchKey = "built" | "target";

export type Kid = Record<ArchKey, Partial<Record<SecKey, Section>>>;
export type KidBox = Record<ArchKey, Partial<Record<SecKey | "_", Record<string, string>>>>;

/* ---------- tool scorecard ---------- */
export interface Tool { n: string; ic: string; cap: number; fit: number; ad: 1 | 2 | 3; pick: "" | "pick" | "planned" | "target"; why: string }
export interface Cat { id: string; n: string; st: "built" | "target"; kid: string; t: Tool[] }

/* ---------- landscape ---------- */
export type Status = "built" | "part" | "gap" | "rev" | "here" | "target";
export interface Tile { n: string; c: string; s: Status; st: number[]; d: string; m: number }
export interface Band { h: string; sm: string; c: string; g: [group: string, tiles: Tile[]][] }
export interface View {
  sub: string;
  legend: [cls: string, label: string][];
  steps?: [n: string, label: string][];
  bands?: Band[];
  rows?: [layer: string, color: string, rows: [q: string, how: string, ind: string, st: string][]][];
}
