export function pageMeta(title: string, description: string, opts: { path?: string; noindex?: boolean } = {}) {
  const full = `${title} | Sharma's Kitchen`;
  const meta: Record<string, string>[] = [
    { title: full },
    { name: "description", content: description },
    { property: "og:title", content: full },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (opts.path) meta.push({ property: "og:url", content: opts.path });
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return { meta, links: opts.path ? [{ rel: "canonical", href: opts.path }] : [] };
}
