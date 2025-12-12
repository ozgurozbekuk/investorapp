import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/actions/user.action";

export default async function ProfileIndexPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await syncUser();

  const username =
    user.username ?? user.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  if (!username) {
    redirect("/");
  }

  redirect(`/profile/${username}`);
}
