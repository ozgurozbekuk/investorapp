"use client";

import { joinGroup, leaveGroup } from "@/actions/group.action";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function GroupMembershipButton({ groupId, isMember }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      try {
        if (isMember) {
          await leaveGroup(groupId);
        } else {
          await joinGroup(groupId);
        }
        router.refresh();
      } catch (error) {
        console.error("Failed to update membership", error);
      }
    });
  };

  return (
    <Button
      variant={isMember ? "outline" : "default"}
      onClick={handleClick}
      disabled={pending}
      className="min-w-24"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isMember ? (
        "Leave"
      ) : (
        "Join"
      )}
    </Button>
  );
}
