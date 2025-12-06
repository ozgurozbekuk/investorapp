"use client";

import { createComment, deletePost } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import {
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function PostCard({ post, dbUserId }) {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(!!post.isLikedByMe);
  const [hasDisliked, setHasDisliked] = useState(!!post.isDislikedByMe);
  const [likesCount, setLikesCount] = useState(
    post.likesCount ?? post._count?.likes ?? post.likes?.length ?? 0
  );
  const [dislikesCount, setDislikesCount] = useState(
    post.dislikesCount ?? post._count?.dislikes ?? post.dislikes?.length ?? 0
  );
  const [showComments, setShowComments] = useState(false);

  // Safely format timestamps (handles Date, number, string, null/invalid)
  const formatTime = (value) => {
    if (!value) return "just now";
    try {
      let date;
      if (value instanceof Date) date = value;
      else if (typeof value === "number") date = new Date(value);
      else if (typeof value === "string") date = parseISO(value);
      else if (typeof value === "object" && typeof value.seconds === "number") {
        date = new Date(value.seconds * 1000);
      } else date = new Date(value);
      if (!isValid(date)) return "just now";
      return `${formatDistanceToNow(date)} ago`;
    } catch {
      return "just now";
    }
  };

  const handleReactionUpdate = (data) => {
    setLikesCount(data.likesCount);
    setDislikesCount(data.dislikesCount);
    setHasLiked(data.isLikedByMe);
    setHasDisliked(data.isDislikedByMe);
    router.refresh();
    queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to toggle like");
      }
      return res.json();
    },
    onSuccess: handleReactionUpdate,
    onError: () => toast.error("Failed to update like"),
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}/dislike`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to toggle dislike");
      }
      return res.json();
    },
    onSuccess: handleReactionUpdate,
    onError: () => toast.error("Failed to update dislike"),
  });

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderHashtags = (text) =>
    (text || "").split(/(#[A-Za-z0-9_]+)/g).map((part, index) =>
      part.startsWith("#") && part.length > 1 ? (
        <span key={index} className="text-blue-600 font-semibold">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span>{formatTime(post.createdAt ?? post.cretedAt)}</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog
                    isDeleting={isDeleting}
                    onDelete={handleDeletePost}
                  />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words whitespace-pre-wrap">
                {renderHashtags(post.content)}
              </p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-blue-600 hover:text-blue-700"
                    : "hover:text-blue-600"
                }`}
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending || dislikeMutation.isPending}
              >
                {hasLiked ? (
                  <ThumbsUpIcon className="size-5 fill-current" />
                ) : (
                  <ThumbsUpIcon className="size-5" />
                )}
                <span className="text-sm font-semibold">{likesCount}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-2"
                >
                  <ThumbsUpIcon className="size-5" />
                  <span className="text-sm font-semibold">{likesCount}</span>
                </Button>
              </SignInButton>
            )}

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasDisliked
                    ? "text-blue-600 hover:text-blue-700"
                    : "hover:text-blue-600"
                }`}
                onClick={() => dislikeMutation.mutate()}
                disabled={likeMutation.isPending || dislikeMutation.isPending}
              >
                <ThumbsDownIcon
                  className={`size-5 ${hasDisliked ? "fill-current" : ""}`}
                />
                <span className="text-sm font-semibold">{dislikesCount}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-2"
                >
                  <ThumbsDownIcon className="size-5" />
                  <span className="text-sm font-semibold">{dislikesCount}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${
                  showComments ? "fill-blue-500 text-blue-500" : ""
                }`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage
                        src={comment.author.image ?? "/avatar.png"}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(comment.createdAt ?? comment.cretedAt)}
                        </span>
                      </div>
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {renderHashtags(comment.content)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default PostCard;
