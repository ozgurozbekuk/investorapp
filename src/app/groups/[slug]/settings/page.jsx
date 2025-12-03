import { updateGroup } from "@/actions/group.action";
import { getDbUserId } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function GroupSettingsPage({ params }) {
  const dbUserId = await getDbUserId();
  if (!dbUserId) {
    redirect("/");
  }

  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      privacy: true,
      tickerSymbol: true,
      ownerId: true,
      slug: true,
    },
  });

  if (!group) {
    notFound();
  }

  if (group.ownerId !== dbUserId) {
    redirect(`/groups/${group.slug}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Group settings</h1>
          <p className="text-sm text-muted-foreground">
            Update details members see about {group.name}.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/groups/${group.slug}`}>Back to group</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateGroup} className="space-y-4">
            <input type="hidden" name="groupId" value={group.id} />

            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Group name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={group.name}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this group about?"
                defaultValue={group.description || ""}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="type" className="text-sm font-medium">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue={group.type}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="GENERAL">General</option>
                  <option value="STOCK">Stock</option>
                  <option value="COMMODITY">Commodity</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="privacy" className="text-sm font-medium">
                  Privacy
                </label>
                <select
                  id="privacy"
                  name="privacy"
                  defaultValue={group.privacy}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="tickerSymbol" className="text-sm font-medium">
                Ticker symbol (optional)
              </label>
              <Input
                id="tickerSymbol"
                name="tickerSymbol"
                placeholder="AAPL"
                maxLength={10}
                defaultValue={group.tickerSymbol || ""}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href={`/groups/${group.slug}`}>Cancel</Link>
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
