import { NextResponse } from "next/server";
import { getTickerPrices } from "@/lib/getTickerData";

const CRYPTO_NAMES = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  ADA: "Cardano",
  AVAX: "Avalanche",
  XRP: "XRP",
  DOGE: "Dogecoin",
  MATIC: "Polygon",
  DOT: "Polkadot",
  LINK: "Chainlink",
  LTC: "Litecoin",
};

// Lightweight market cap ranking to order majors (lower is larger cap)
const CRYPTO_MARKETCAP_RANK = {
  BTC: 1,
  ETH: 2,
  XRP: 3,
  BNB: 4,
  SOL: 5,
  USDT: 6,
  USDC: 7,
  ADA: 8,
  DOGE: 9,
  AVAX: 10,
  TRX: 11,
  TON: 12,
  MATIC: 13,
  DOT: 14,
  LINK: 15,
  LTC: 16,
};

const normalizeSymbol = (symbol) => {
  if (!symbol.includes(":")) return symbol;
  const [, raw] = symbol.split(":");
  return raw.replace("USDT", "");
};

export async function GET() {
  try {
    const quotes = await getTickerPrices();

    let cryptos = quotes
      .filter((quote) => quote.symbol.includes("BINANCE:") && quote.price != null)
      .map((quote) => {
        const clean = normalizeSymbol(quote.symbol);
        return {
          symbol: clean,
          name: CRYPTO_NAMES[clean] ?? clean,
          price: quote.price ?? 0,
          changePercent: quote.percent ?? 0,
        };
      })
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 10);

    const merged = cryptos.sort((a, b) => {
      const rankA = CRYPTO_MARKETCAP_RANK[a.symbol] ?? 999;
      const rankB = CRYPTO_MARKETCAP_RANK[b.symbol] ?? 999;
      return rankA - rankB;
    });

    const top10 = merged.slice(0, 10);

    return NextResponse.json({ cryptos: top10 });
  } catch (error) {
    console.error("cryptos route error", error);
    return NextResponse.json({ cryptos: [] }, { status: 500 });
  }
}
