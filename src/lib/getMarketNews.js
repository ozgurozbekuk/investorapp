// lib/getMarketNews.js
import "server-only";

const FINNHUB_API_KEY = process.env.FINNHUB_KEY;

// Simple helper to fetch market news for the sidebar
export async function getMarketNews() {
  if (!FINNHUB_API_KEY) {
    console.warn("FINNHUB_API_KEY is not set");
    return [];
  }

  // Fetch general market news
  const res = await fetch(
    `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`,
    {
      // Revalidate every 10 minutes on the server
      next: { revalidate: 60 * 10 },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch market news", await res.text());
    return [];
  }

  const data = await res.json();

  // Sort by datetime (newest first) and take first 5
  const sorted = data
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, 5);

  return sorted;
}
