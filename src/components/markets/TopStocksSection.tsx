'use client';

import { fetchTopStocks, StockQuote } from '@/lib/marketsData';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Sparkline from './Sparkline';

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatChange = (value: number) => {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
};

const StockTableSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, idx) => (
      <div
        key={idx}
        className="grid grid-cols-4 md:grid-cols-5 items-center gap-2 px-2 py-3 rounded-md bg-muted/30"
      >
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <div className="hidden md:block">
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    ))}
  </div>
);

export default function TopStocksSection() {
  const { data, isLoading, isError, refetch } = useQuery<StockQuote[]>({
    queryKey: ["top-stocks"],
    queryFn: fetchTopStocks,
  });

  const rows = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top 10 Trending Stocks</span>
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            Market snapshot, refreshed on demand
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <StockTableSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">Could not load market data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-2 pr-3">Symbol</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Daily %</th>
                  <th className="py-2 pr-3 hidden md:table-cell">Sparkline</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-muted/40">
                    <td className="py-3 pr-3 font-semibold">{stock.symbol}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{stock.name}</td>
                    <td className="py-3 pr-3 font-medium">{currencyFormatter.format(stock.price)}</td>
                    <td className={`py-3 pr-3 font-semibold ${stock.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatChange(stock.changePercent)}
                    </td>
                    <td className="py-3 pr-3 hidden md:table-cell">
                      <Sparkline points={stock.sparkline} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
