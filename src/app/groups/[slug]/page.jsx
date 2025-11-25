import { getGroupPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import DeleteGroupButton from "@/components/DeleteGroupButton";
import GroupMembershipButton from "@/components/GroupMembershipButton";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GroupDetailPage({ params }) {
  const dbUserId = await getDbUserId();
  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    include: {
      owner: {
        select: { id: true, name: true, username: true },
      },
      members: dbUserId
        ? {
            where: { userId: dbUserId },
            select: { id: true },
          }
        : false,
      _count: {
        select: { members: true, posts: true },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const isMember = dbUserId ? (group.members?.length ?? 0) > 0 : false;
  const isOwner = dbUserId === group.owner?.id;
  const posts = await getGroupPosts(group.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-sm text-muted-foreground">
            {group.type} · {group.privacy} group
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GroupMembershipButton groupId={group.id} isMember={isMember} />
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
          {isOwner && (
            <DeleteGroupButton groupId={group.id} />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {group.description || "This group has no description yet."}
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Ticker</p>
              <p className="font-medium">
                {group.tickerSymbol || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Members</p>
              <p className="font-medium">{group._count.members}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Posts</p>
              <p className="font-medium">{group._count.posts}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Owner</p>
              <p className="font-medium">
                {group.owner?.name || group.owner?.username || "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isMember ? (
        <CreatePost
          groupId={group.id}
          placeholder={`Share something with ${group.name}`}
        />
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Join this group to post and engage with members.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.length ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No posts yet. Be the first to share something!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
