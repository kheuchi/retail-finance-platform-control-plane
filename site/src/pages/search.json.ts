/* The search index as a static file; the search box fetches it on first use. */
import type { APIRoute } from "astro";
import { buildIndex } from "../lib/search";

export const GET: APIRoute = () => new Response(JSON.stringify(buildIndex()), { headers: { "Content-Type": "application/json" } });
