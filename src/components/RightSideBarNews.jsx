import { getMarketNews } from "@/lib/getMarketNews";

// Helper to convert unix time to "10m", "2h", "1d"
function timeAgoFromUnix(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp * 1000;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffH = Math.floor(diffMin / 60);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

export default async function RightSidebarNews() {
  const news = await getMarketNews();

  return (
    <section className="rounded-xl border border-border bg-card text-card-foreground p-4 text-sm shadow-sm">
      <h2 className="text-sm font-semibold mb-3">Market news</h2>

      {news.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Could not load market news. Check API key.
        </p>
      )}

      <ul className="space-y-3">
        {news.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {item.source}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgoFromUnix(item.datetime)}
                </span>
              </div>

              <p className="text-sm font-medium group-hover:underline line-clamp-2">
                {item.headline}
              </p>

              <span
                className="inline-flex w-fit rounded-full bg-primary/15 text-primary px-3 py-1 text-[12px]"
              >
                {item.category}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
