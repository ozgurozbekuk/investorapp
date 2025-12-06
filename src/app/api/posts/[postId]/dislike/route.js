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

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    const existingDislike = await prisma.dislike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    await prisma.$transaction(async (tx) => {
      if (existingDislike) {
        await tx.dislike.delete({
          where: { userId_postId: { userId, postId } },
        });
        return;
      }

      if (existingLike) {
        await tx.like.delete({
          where: { userId_postId: { userId, postId } },
        });
      }

      await tx.dislike.create({
        data: {
          userId,
          postId,
        },
      });
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
    console.error("dislike route error", error);
    return NextResponse.json({ error: "Failed to toggle dislike" }, { status: 500 });
  }
}
