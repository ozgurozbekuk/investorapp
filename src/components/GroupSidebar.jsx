"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { joinGroup, leaveGroup, searchGroups } from "@/actions/group.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

const MAX_GROUPS = 6;

export default function GroupSidebar({ initialGroups = [] }) {
  const [groups, setGroups] = useState(initialGroups.slice(0, MAX_GROUPS));
  const [query, setQuery] = useState("");
  const [isSearching, startSearching] = useTransition();
  const [isMutating, startMutating] = useTransition();
  const [activeGroupId, setActiveGroupId] = useState(null);

  const runSearch = (value) => {
    startSearching(async () => {
      try {
        const results = await searchGroups(value);
        setGroups(results.slice(0, MAX_GROUPS));
      } catch (error) {
        console.error("Failed to search groups", error);
      }
    });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    runSearch(value);
  };

  const handleToggleMembership = (groupId, isMember) => {
    setActiveGroupId(groupId);
    startMutating(async () => {
      try {
        if (isMember) {
          await leaveGroup(groupId);
        } else {
          await joinGroup(groupId);
        }

        const updated = await searchGroups(query);
        setGroups(updated.slice(0, MAX_GROUPS));
      } catch (error) {
        console.error("Failed to update membership", error);
      } finally {
        setActiveGroupId(null);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Groups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search groups"
          value={query}
          onChange={handleSearchChange}
          aria-label="Search groups"
        />

        <div className="space-y-2">
          {groups.length ? (
            groups.map((group) => {
              const pending = isMutating && activeGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                    <div className="flex flex-col">
                      <Link href={`/groups/${group.slug}`} className="font-semibold">{group.name}</Link>
                    {group.tickerSymbol && (
                      <span className="text-xs uppercase text-muted-foreground">
                        {group.tickerSymbol}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={group.isMember ? "outline" : "default"}
                    onClick={() =>
                      handleToggleMembership(group.id, group.isMember)
                    }
                    disabled={pending}
                  >
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : group.isMember ? (
                      "Leave"
                    ) : (
                      "Join"
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              {isSearching ? "Searching groups..." : "No groups found"}
            </p>
          )}
        </div>

        <Button className="w-full" asChild>
          <Link href="/groups/create">Create Group</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
