import { NextResponse } from "next/server";
import { getMarketNews } from "@/lib/getMarketNews";

export async function GET() {
  try {
    const news = await getMarketNews();

    const normalized = (news ?? []).slice(0, 5).map((item) => ({
      id: String(item.id ?? item.url),
      title: item.headline ?? item.title ?? "Untitled",
      source: item.source ?? "Unknown",
      url: item.url,
      publishedAt: item.datetime
        ? new Date(item.datetime * 1000).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ news: normalized });
  } catch (error) {
    console.error("market news route error", error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}
