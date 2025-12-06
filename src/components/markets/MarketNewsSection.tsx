'use client';

import { fetchMarketNews, MarketNewsItem } from '@/lib/marketsData';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

const NewsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="rounded-md border bg-muted/40 px-4 py-3 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ))}
  </div>
);

export default function MarketNewsSection() {
  const { data, isLoading, isError, refetch } = useQuery<MarketNewsItem[]>({
    queryKey: ["market-news"],
    queryFn: fetchMarketNews,
  });

  const articles = (data ?? []).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Latest Market News</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">Headlines across equities & crypto</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <NewsSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">Could not load market news.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-md border px-4 py-3 hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{item.source ?? "Unknown source"}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                  <span>{formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</span>
                </div>
                <div className="mt-1 flex items-start gap-2">
                  <p className="text-sm font-semibold leading-snug group-hover:text-primary flex-1">
                    {item.title}
                  </p>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
