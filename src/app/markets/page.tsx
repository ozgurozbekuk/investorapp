import MarketNewsSection from "@/components/markets/MarketNewsSection";
import TopCryptosSection from "@/components/markets/TopCryptosSection";
import TopStocksSection from "@/components/markets/TopStocksSection";

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Markets</h1>
        <p className="text-sm text-muted-foreground">
          Track what&rsquo;s moving in stocks, crypto, and the headlines shaping them.
        </p>
      </div>

      <TopStocksSection />
      <TopCryptosSection />
      <MarketNewsSection />
    </div>
  );
}
