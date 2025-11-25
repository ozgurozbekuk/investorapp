"use client";

import { deleteGroup } from "@/actions/group.action";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteGroupButton({ groupId, className }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Delete this group? This cannot be undone.")) return;

    startTransition(async () => {
      try {
        await deleteGroup(groupId);
        router.push("/");
      } catch (error) {
        console.error("Failed to delete group", error);
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className={className}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="h-4 w-4" />
          Delete
        </>
      )}
    </Button>
  );
}
