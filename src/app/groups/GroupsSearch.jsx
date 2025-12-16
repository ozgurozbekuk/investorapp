"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { searchGroups } from "@/actions/group.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function GroupsSearch({ initialGroups = [] }) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState(initialGroups);
  const [isSearching, startSearching] = useTransition();

  const runSearch = (value) => {
    startSearching(async () => {
      try {
        const results = await searchGroups(value);
        setGroups(results);
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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, ticker, or slug"
          value={query}
          onChange={handleSearchChange}
          aria-label="Search groups"
          className="pl-9"
        />
        {isSearching ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

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
          {isSearching
            ? "Searching groups..."
            : query.trim()
              ? "No groups match that search."
              : "No groups yet. Be the first to create one."}
        </p>
      )}
    </div>
  );
}
