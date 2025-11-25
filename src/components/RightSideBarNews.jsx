// app/(feed)/_components/RightSidebarNews.jsx
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
    <section
      className="
        rounded-2xl p-4 text-sm shadow-sm 
        bg-white/90 dark:bg-zinc-900/80
        border-default    /* uses your global border */
      "
    >
      <h2 className="text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
        Market news
      </h2>

      {news.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                <span className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {item.source}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {timeAgoFromUnix(item.datetime)}
                </span>
              </div>

              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline line-clamp-2">
                {item.headline}
              </p>

              <span
                className="
                  inline-flex w-fit rounded-full
                  bg-red-800 text-zinc-100
                  px-3 py-1 text-[12px]
                  dark:bg-red-800 dark:text-zinc-100 
                "
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
