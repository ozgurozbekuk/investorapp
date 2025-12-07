"use client";

import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}) {
  const { user: currentUser } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState(user);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [counts, setCounts] = useState({
    followers: user._count?.followers ?? 0,
    following: user._count?.following ?? 0,
    posts: user._count?.post ?? 0,
  });

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const currentUsername =
    currentUser?.username ??
    currentUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  const isOwnProfile = currentUsername === profile.username;
  const formattedDate = format(new Date(profile.createdAt), "MMMM yyyy");

  const handleEditSubmit = async () => {
    try {
      setIsSavingProfile(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error();

      setProfile((prev) => ({ ...prev, ...editForm }));
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setCounts((prev) => ({
        ...prev,
        followers: prev.followers + (isFollowing ? -1 : 1),
      }));
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.32),_transparent_45%)]" />
        </div>
        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile.image ?? "/avatar.png"} />
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold leading-tight">
                    {profile.name || profile.username}
                  </h1>
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Joined {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {!currentUser ? (
                <SignInButton mode="modal">
                  <Button className="w-full">Follow</Button>
                </SignInButton>
              ) : isOwnProfile ? (
                <Button
                  className="w-full"
                  onClick={() => setShowEditDialog(true)}
                >
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit profile
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleFollow}
                  disabled={isUpdatingFollow}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isUpdatingFollow
                    ? "Updating..."
                    : isFollowing
                    ? "Unfollow"
                    : "Follow"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {profile.location && (
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <MapPinIcon className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 hover:text-foreground"
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon className="h-4 w-4" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.bio ? (
              <p className="leading-relaxed text-foreground">{profile.bio}</p>
            ) : (
              <p className="text-muted-foreground">No bio yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xl font-semibold">
                  {counts.posts.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xl font-semibold">
                  {counts.followers.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xl font-semibold">
                  {counts.following.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger
                value="posts"
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <FileTextIcon className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="likes"
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <HeartIcon className="h-4 w-4" />
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6 space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={profile.id} />
                ))
              ) : (
                <div className="rounded-xl border bg-muted/40 p-8 text-center text-muted-foreground">
                  No posts yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="likes" className="mt-6 space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={profile.id} />
                ))
              ) : (
                <div className="rounded-xl border bg-muted/40 p-8 text-center text-muted-foreground">
                  No liked posts to show.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                name="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                name="bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="min-h-[100px]"
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                name="location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                placeholder="Where are you based?"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                name="website"
                value={editForm.website}
                onChange={(e) =>
                  setEditForm({ ...editForm, website: e.target.value })
                }
                placeholder="Your personal website"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit} disabled={isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default ProfilePageClient;
