"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";


//create group
export async function createGroup(formData) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const name = formData.get("name");
  const description = formData.get("description") || "";
  const type = formData.get("type") || "GENERAL"; // STOCK | COMMODITY | GENERAL
  const tickerSymbol = formData.get("tickerSymbol") || null;

  if (!name || typeof name !== "string") {
    throw new Error("Group name is required");
  }

  // Simple slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  // Create the group
  const group = await prisma.group.create({
    data: {
      name,
      slug,
      description,
      type,
      tickerSymbol,
      ownerId: userId,
    },
  });

  // Add creator as OWNER member
  await prisma.groupMember.create({
    data: {
      userId,
      groupId: group.id,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  revalidatePath("/");

  // Redirect to the group page
  redirect(`/groups/${group.slug}`);
}


//Join group
export async function joinGroup(groupId) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Check if the user is already a member
  const existing = await prisma.groupMember.findFirst({
    where: { userId, groupId },
  });

  if (existing) return existing;

  // Create new membership
  const member = await prisma.groupMember.create({
    data: {
      userId,
      groupId,
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  return member;
}

//leave group
export async function leaveGroup(groupId) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Remove membership
  await prisma.groupMember.deleteMany({
    where: { userId, groupId },
  });

  return true;
}

//Search group
export async function searchGroups(query) {
  const userId = await getDbUserId();

  const q = (query || "").trim();

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { tickerSymbol: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const groups = await prisma.group.findMany({
    where,
    take: 10,
    orderBy: { createdAt: "desc" },
    include: userId
      ? {
          members: {
            where: { userId },
            select: { id: true },
          },
        }
      : false,
  });

  // Return a flat, serializable shape
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    tickerSymbol: g.tickerSymbol,
    isMember: userId ? g.members.length > 0 : false,
  }));
}

//Delete group (owner only)
export async function deleteGroup(groupId) {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, ownerId: true, slug: true },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  if (group.ownerId !== userId) {
    throw new Error("Only the owner can delete this group");
  }

  await prisma.$transaction([
    prisma.groupMember.deleteMany({ where: { groupId } }),
    prisma.post.deleteMany({ where: { groupId } }),
    prisma.group.delete({ where: { id: groupId } }),
  ]);

  revalidatePath("/");
  return true;
}
