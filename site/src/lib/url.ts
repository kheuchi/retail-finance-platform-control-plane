/** Link to a page of this site, under the configured base . */
export const url = (path = "") => import.meta.env.BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
