"use server";

import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";

export const createPost = async (content, image) => {
  try {
    console.log("abc")
    const userId = await getDbUserId();

    if (!userId) return;

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
      },
    });
    revalidatePath("/"); 
    return { success: true, post };
  } catch (error) {
        console.error("Failed to create post:", error);
        return { success: false, error: "Failed to create post" };
  }
};

export const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { cretedAt: "desc", },
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

    return posts; 
  } catch (error) {
    console.error("Error in getPosts", error);
    throw new Error("Failled to fetch post"); 
  }
};
