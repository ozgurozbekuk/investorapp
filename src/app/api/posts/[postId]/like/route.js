import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDbUserId } from "@/actions/user.action";

export async function POST(_req, { params }) {
  const { postId } = params;
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    const existingDislike = await prisma.dislike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.like.delete({
          where: { userId_postId: { userId, postId } },
        });
        return;
      }

      if (existingDislike) {
        await tx.dislike.delete({
          where: { userId_postId: { userId, postId } },
        });
      }

      await tx.like.create({
        data: {
          userId,
          postId,
        },
      });

      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "LIKE",
            userId: post.authorId,
            creatorId: userId,
            postId,
          },
        });
      }
    });

    const updated = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        _count: { select: { likes: true, dislikes: true } },
        likes: { select: { userId: true }, where: { userId } },
        dislikes: { select: { userId: true }, where: { userId } },
      },
    });

    return NextResponse.json({
      likesCount: updated._count.likes,
      dislikesCount: updated._count.dislikes,
      isLikedByMe: updated.likes.length > 0,
      isDislikedByMe: updated.dislikes.length > 0,
    });
  } catch (error) {
    console.error("like route error", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
