"use server";

const SYMBOLS = [
  "AAPL",
  "MSFT",
  "TSLA",
  "NVDA",
  "AMZN",
  "META",
  "GOOGL",
  "NFLX",
  "BTC-USD",
  "ETH-USD",
  "BABA",
  "TSM",
  "ORCL",
  "INTC",
  "AMD",
  "BA",
  "NIO",
  "VTI",
  "VOO",
  "QQQ",
  "DIA",
  "ARKK",
  "XLF",
  "XLK",
  "USO",
  "XLE",
  "GLD",
  "SLV",
  "SONY",
  "TM",
  "NSANY",
];



export async function getTickerPrices() {

  const requests = SYMBOLS.map((symbol) =>
    fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => ({
        symbol,
        price: json && json.c != null ? json.c : null,
      }))
      .catch(() => ({
        symbol,
        price: null,
      }))
  );

  const results = await Promise.all(requests);

  return results.filter((r) => r.price !== null);
}
