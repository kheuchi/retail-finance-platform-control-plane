/* Short constructors that keep the architecture content readable: one line per box, arrow or participant. */
import type { El, Rel, Part, Msg, Layer, CssVar } from "../types";

/** Layer → colour token from site.css. */
export const LY: Record<Layer, CssVar> = {
  person: "--people", people: "--people", agent: "--agent", gate: "--gate", data: "--data", ml: "--ml",
  know: "--know", base: "--base", google: "--ml", aws: "--gate", dbx: "--data",
};

/** A box. r: row or "1 / span 3"; x: "focus" | "gap". */
export const E = (id: string, k: El["k"], n: string, d: string, ic: string, c: number, r: El["r"], cs = 1, ly: Layer = "base", x: El["x"] = ""): El =>
  ({ id, k, n, d, ic, c, r, cs, ly, x });

/** An arrow. o: { e, f, m, dash, both }. */
export const R = (a: string, b: string, w = "", rt: Rel["rt"] = "h", o: Partial<Pick<Rel, "e" | "f" | "m" | "dash" | "both">> = {}): Rel =>
  ({ a, b, w, rt, ...o });

/** A participant in a sequence diagram. */
export const P = (id: string, n: string, ic: string, ly: Layer = "base"): Part => ({ id, n, ic, ly });

/** A message in a sequence diagram; back = dashed reply. */
export const M = (a: string, b: string, l: string, p?: string, back = 0): Msg => ({ a, b, l, p, back });

/** Status cell for tables (HTML, rendered as is because it starts with <span). */
export const st = (s: "ok" | "part" | "gap"): string =>
  ({ ok: '<span class="ok">● in place</span>', part: '<span class="part">● partly</span>', gap: '<span class="gap">● missing</span>' })[s];
