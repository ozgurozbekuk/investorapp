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
