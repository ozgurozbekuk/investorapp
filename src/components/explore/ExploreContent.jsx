"use client";

import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

const TABS = [
  { key: "all", label: "All" },
  { key: "discussions", label: "Discussions" },
  { key: "assets", label: "Assets" },
  { key: "topics", label: "Topics" },
  { key: "investors", label: "Top Investors" },
];

const calculateEngagement = (post) => post.likesCount ?? 0;

const matchesQuery = (post, query) => {
  if (!query) return true;
  const text = query.toLowerCase();
  const contentMatch = (post.content || "").toLowerCase().includes(text);
  const tagMatches =
    (post.content || "")
      .match(/#([A-Za-z0-9_]+)/g)
      ?.some((tag) => tag.toLowerCase().includes(text)) ?? false;
  return contentMatch || tagMatches;
};

export default function ExploreContent({ posts, dbUserId, topics }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState("");

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => calculateEngagement(b) - calculateEngagement(a)
      ),
    [posts]
  );

  const filteredPosts = useMemo(
    () => sortedPosts.filter((post) => matchesQuery(post, query)),
    [sortedPosts, query]
  );

  const hashtagPosts = useMemo(
    () =>
      sortedPosts.filter((post) =>
        (post.content || "").match(/#([A-Za-z0-9_]+)/g)
      ),
    [sortedPosts]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "assets":
        return (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Assets coming soon.
          </div>
        );
      case "topics":
        return hashtagPosts.length ? (
          <div className="space-y-4">
            {hashtagPosts.map((post) => (
              <PostCard key={post.id} post={post} dbUserId={dbUserId} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            No hashtagged posts yet.
          </div>
        );
      case "investors":
        return (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Top Investors coming soon.
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                {query
                  ? "No discussions match your search."
                  : "No discussions yet."}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} dbUserId={dbUserId} />
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Discover what the community is discussing right now.
        </p>
      </div>

      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(searchValue.trim());
        }}
      >
        <Input
          placeholder="Search users, assets, or topics"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setQuery(searchValue.trim());
            }
          }}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Popular Discussions</h2>
          {query ? (
            <span className="text-xs text-muted-foreground">
              Showing results for “{query}”
            </span>
          ) : null}
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
}
