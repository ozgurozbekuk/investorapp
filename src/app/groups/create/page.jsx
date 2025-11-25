import { createGroup } from "@/actions/group.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreateGroupPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a Group</CardTitle>
          <p className="text-sm text-muted-foreground">
            Bring people together around a market, ticker, or idea.
          </p>
        </CardHeader>
        <CardContent>
          <form action={createGroup} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Group name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Investors United"
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
                  defaultValue="GENERAL"
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="GENERAL">General</option>
                  <option value="STOCK">Stock</option>
                  <option value="COMMODITY">Commodity</option>
                </select>
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
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button type="submit">Create group</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
