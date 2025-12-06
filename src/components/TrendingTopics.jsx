import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { getTrendingTopics } from "@/actions/post.action";

export default async function TrendingTopics() {
  const topics = await getTrendingTopics();
  const topFive = topics.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        {topFive.length ? (
          <div className="flex flex-col gap-2">
            {topFive.map((topic) => (
              <div
                key={topic.tag}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
              >
                <Button
                  variant="outline"
                  className="rounded-full text-sm"
                >
                  {topic.tag}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {topic.count} posts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No trending topics yet. Start posting with hashtags like #markets.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
