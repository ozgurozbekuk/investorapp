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
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BRK.B", // Berkshire Hathaway
  "JPM", // JPMorgan Chase
  "V", // Visa
  "MA", // Mastercard
  "KO", // Coca-Cola
  "PEP", // PepsiCo
  "DIS", // Walt Disney
  "NKE", // Nike
  "ADBE", // Adobe
  "ORCL", // Oracle
  "INTC", // Intel
  "CSCO", // Cisco
  "PYPL", // PayPal
  "CRM", // Salesforce
  "XOM", // Exxon Mobil
  "CVX", // Chevron
  "WMT", // Walmart
  "MCD", // McDonald's
  "SBUX",
];

export async function getTickerPrices() {
  const token = process.env.FINNHUB_KEY;
  if (!token) {
    console.error("FINNHUB_KEY missing");
    return [];
  }

  const requests = SYMBOLS.map((symbol) =>
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json || json.c == null || json.pc == null) {
          return {
            symbol,
            price: null,
            change: null,
            percent: null,
            isUp: null,
          };
        }

        const price = json.c;
        const prev = json.pc;
        const change = price - prev;
        const percent = prev !== 0 ? (change / prev) * 100 : null;

        return {
          symbol,
          price,
          change,
          percent,
          isUp: change > 0,
        };
      })
      .catch(() => ({
        symbol,
        price: null,
        change: null,
        percent: null,
        isUp: null,
      }))
  );

  const results = await Promise.all(requests);

  return results.filter((r) => r.price !== null);
}
