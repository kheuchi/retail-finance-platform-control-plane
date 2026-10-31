/** Link to a page of this site, under the configured base (/…/v2 while the new site is in preview). */
export const url = (path = "") => import.meta.env.BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
