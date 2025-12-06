import { getPosts, getTrendingTopics } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import ExploreContent from "@/components/explore/ExploreContent";

export default async function ExplorePage() {
  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  const topics = await getTrendingTopics();

  return (
    <ExploreContent posts={posts} dbUserId={dbUserId} topics={topics} />
  );
}
