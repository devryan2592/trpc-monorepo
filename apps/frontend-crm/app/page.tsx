import { Button } from "@workspace/ui/components/button";
import UserExample from "@/components/userExample";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

export default async function Page() {
  prefetch(trpc.user.me.queryOptions());

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello</h1>
        <Button size="sm">Button</Button>
        <HydrateClient>
          <Suspense>
            <UserExample />
          </Suspense>
        </HydrateClient>
      </div>
    </div>
  );
}
