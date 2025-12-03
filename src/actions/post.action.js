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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts.map((post) => {
      const { cretedAt, comments, ...rest } = post;

      return {
        ...rest,
        createdAt: serializeDate(rest.createdAt ?? cretedAt),
        updatedAt: serializeDate(rest.updatedAt),
        comments: comments.map((comment) => ({
          ...comment,
          createdAt: serializeDate(comment.createdAt),
          updatedAt: serializeDate(comment.updatedAt),
        })),
      };
    });
  } catch (error) {
    console.error("Error in getPosts", error);
    return [];
  }
};

export const getGroupPosts = async (groupId) => {
  try {
    if (!groupId) return [];

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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts.map((post) => {
      const { cretedAt, comments, ...rest } = post;

      return {
        ...rest,
        createdAt: serializeDate(rest.createdAt ?? cretedAt),
        updatedAt: serializeDate(rest.updatedAt),
        comments: comments.map((comment) => ({
          ...comment,
          createdAt: serializeDate(comment.createdAt),
          updatedAt: serializeDate(comment.updatedAt),
        })),
      };
    });
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
