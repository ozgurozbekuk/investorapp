"use server";

import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";

export const createPost = async (content, image, groupId) => {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    if (groupId) {
      const membership = await prisma.groupMember.findFirst({
        where: { groupId, userId, status: "ACTIVE" },
      });
      if (!membership) {
        return { success: false, error: "Join the group to post." };
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
        groupId: groupId || null,
      },
    });

    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { slug: true },
      });
      if (group?.slug) {
        revalidatePath(`/groups/${group.slug}`);
      }
    } else {
      revalidatePath("/");
    }

    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
};

const serializeDate = (value) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
};

export const getPosts = async () => {
  try {
    const userId = await getDbUserId();
    const posts = await prisma.post.findMany({
      where: { groupId: null },
      orderBy: { cretedAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        dislikes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            dislikes: true,
          },
        },
      },
    });

    const transformed = posts.map((post) => {
      const { cretedAt, comments, likes, dislikes, ...rest } = post;

      return {
        ...rest,
        createdAt: serializeDate(rest.createdAt ?? cretedAt),
        updatedAt: serializeDate(rest.updatedAt),
        likes,
        dislikes,
        likesCount: post._count?.likes ?? likes.length,
        dislikesCount: post._count?.dislikes ?? dislikes.length,
        isLikedByMe: userId ? likes.some((like) => like.userId === userId) : false,
        isDislikedByMe: userId
          ? dislikes.some((dislike) => dislike.userId === userId)
          : false,
        comments: comments.map((comment) => ({
          ...comment,
          createdAt: serializeDate(comment.createdAt),
          updatedAt: serializeDate(comment.updatedAt),
        })),
      };
    });

    return transformed.sort(
      (a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0)
    );
  } catch (error) {
    console.error("Error in getPosts", error);
    return [];
  }
};

export const getTrendingTopics = async () => {
  try {
    const posts = await prisma.post.findMany({
      select: { content: true },
      orderBy: { cretedAt: "desc" },
      take: 200,
    });

    const counts = new Map();

    for (const post of posts) {
      const matches = (post.content || "").match(/#([A-Za-z0-9_]+)/g);
      if (!matches) continue;

      // Deduplicate per post to avoid inflated counts from repeats in one post
      const uniqueTags = Array.from(new Set(matches.map((tag) => tag.trim())));

      uniqueTags.forEach((tag) => {
        const key = tag.toLowerCase();
        const current = counts.get(key) || { tag, count: 0 };
        counts.set(key, { tag: current.tag, count: current.count + 1 });
      });
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch (error) {
    console.error("Error in getTrendingTopics", error);
    return [];
  }
};

export const getGroupPosts = async (groupId) => {
  try {
    if (!groupId) return [];
    const userId = await getDbUserId();

    const posts = await prisma.post.findMany({
      where: { groupId },
      orderBy: { cretedAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        dislikes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            dislikes: true,
          },
        },
      },
    });

    const transformed = posts.map((post) => {
      const { cretedAt, comments, likes, dislikes, ...rest } = post;

      return {
        ...rest,
        createdAt: serializeDate(rest.createdAt ?? cretedAt),
        updatedAt: serializeDate(rest.updatedAt),
        likes,
        dislikes,
        likesCount: post._count?.likes ?? likes.length,
        dislikesCount: post._count?.dislikes ?? dislikes.length,
        isLikedByMe: userId ? likes.some((like) => like.userId === userId) : false,
        isDislikedByMe: userId
          ? dislikes.some((dislike) => dislike.userId === userId)
          : false,
        comments: comments.map((comment) => ({
          ...comment,
          createdAt: serializeDate(comment.createdAt),
          updatedAt: serializeDate(comment.updatedAt),
        })),
      };
    });

    return transformed.sort(
      (a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0)
    );
  } catch (error) {
    console.error("Error in getGroupPosts", error);
    return [];
  }
};

export const toggleLike = async (postId) => {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  receiverId: post.authorId,
                  senderId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);

      revalidatePath("/");
    }
  } catch (error) {
    console.error("Error in toggleLike", error);
    throw new Error("Failed to toggle like");
  }
};

export const createComment = async (postId, content) => {
  
try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Authentication required" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
