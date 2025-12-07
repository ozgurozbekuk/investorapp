export const dynamic = "force-dynamic";

import { searchGroups } from "@/actions/group.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function GroupsPage() {
  const groups = await searchGroups("");

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm">
            Browse existing groups and jump into the conversation.
          </p>
        </div>
        <Button asChild>
          <Link href="/groups/create">Create group</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length ? (
            <div className="flex flex-wrap gap-3">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant="outline"
                  className="gap-2 rounded-full"
                  asChild
                >
                  <Link href={`/groups/${group.slug}`}>
                    <span className="font-medium">{group.name}</span>
                    {group.tickerSymbol ? (
                      <span className="text-xs uppercase text-muted-foreground">
                        {group.tickerSymbol}
                      </span>
                    ) : null}
                  </Link>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No groups yet. Be the first to create one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
