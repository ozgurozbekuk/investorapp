export type StockQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline?: number[];
};

export type CryptoAsset = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline?: number[];
};

export type MarketNewsItem = {
  id: string;
  title: string;
  source?: string;
  url: string;
  publishedAt: string;
};

export async function fetchTopStocks(): Promise<StockQuote[]> {
  try {
    const res = await fetch("/api/markets/stocks");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    const stocks = data?.stocks ?? [];
    if (!stocks.length) throw new Error("Empty stocks payload");
    return stocks;
  } catch (error) {
    console.error("fetchTopStocks error", error);
    throw error;
  }
}

export async function fetchTopCryptos(): Promise<CryptoAsset[]> {
  try {
    const res = await fetch("/api/markets/cryptos");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    const cryptos = data?.cryptos ?? [];
    if (!cryptos.length) throw new Error("Empty cryptos payload");
    return cryptos;
  } catch (error) {
    console.error("fetchTopCryptos error", error);
    throw error;
  }
}

export async function fetchMarketNews(): Promise<MarketNewsItem[]> {
  try {
    const res = await fetch("/api/markets/news");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    if (!data?.news?.length) throw new Error("Empty news payload");
    return data.news;
  } catch (error) {
    console.error("fetchMarketNews error", error);
    throw error;
  }
}
