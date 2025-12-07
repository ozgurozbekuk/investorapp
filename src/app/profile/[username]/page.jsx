import { notFound } from "next/navigation";
import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "./ProfilePageClient";

export const generateMetadata = async ({ params }) => {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) {
    return {
      title: "User Not Found",
      description: `The user ${params.username} does not exist.`,
    };
  }

  return {
    title: `${user.name} (@${user.username})`,
    description:
      user.bio ||
      `View the profile of ${user.name} (@${user.username}) on InvestorApp.`,
  };
};

const ProfilePageServer = async ({ params }) => {
  const { username } = await params;
  const user = await getProfileByUsername(username);



  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);
  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
};

export default ProfilePageServer;
