import FindRoomButton from "@/components/FindRoomButton";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  const router = useRouter();

  if (!session?.user) {
    router.navigate({ to: "/login" });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <FindRoomButton />
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome back, {session?.user?.username || "User"}!</p>
      </div>
    </div>
  );
}
