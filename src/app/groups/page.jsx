export const dynamic = "force-dynamic";

import { searchGroups } from "@/actions/group.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GroupsSearch from "./GroupsSearch";

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
          <GroupsSearch initialGroups={groups} />
        </CardContent>
      </Card>
    </div>
  );
}
