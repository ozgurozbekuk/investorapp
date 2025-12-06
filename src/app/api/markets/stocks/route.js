import { NextResponse } from "next/server";
import { getTickerPrices } from "@/lib/getTickerData";

const STOCK_NAMES = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  TSLA: "Tesla",
  NVDA: "NVIDIA",
  AMZN: "Amazon",
  META: "Meta",
  GOOGL: "Alphabet",
  NFLX: "Netflix",
  "BRK.B": "Berkshire Hathaway",
  JPM: "JPMorgan Chase",
  V: "Visa",
  MA: "Mastercard",
  KO: "Coca-Cola",
  PEP: "PepsiCo",
  DIS: "Disney",
  NKE: "Nike",
  ADBE: "Adobe",
  ORCL: "Oracle",
  INTC: "Intel",
  CSCO: "Cisco",
  PYPL: "PayPal",
  CRM: "Salesforce",
  XOM: "Exxon Mobil",
  CVX: "Chevron",
  WMT: "Walmart",
  MCD: "McDonald's",
  SBUX: "Starbucks",
};

export async function GET() {
  try {
    const quotes = await getTickerPrices();

    const liveStocks = quotes
      .filter((quote) => !quote.symbol.includes("BINANCE:") && quote.price != null)
      .map((quote) => ({
        symbol: quote.symbol,
        name: STOCK_NAMES[quote.symbol] ?? quote.symbol,
        price: quote.price ?? 0,
        changePercent: quote.percent ?? 0,
      }));

    const merged = liveStocks
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 10);

    return NextResponse.json({ stocks: merged });
  } catch (error) {
    console.error("stocks route error", error);
    return NextResponse.json({ stocks: [] }, { status: 500 });
  }
}
