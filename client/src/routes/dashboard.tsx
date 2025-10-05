import FindRoomButton from "@/components/FindRoomButton";
import { authClient, fetchUserSession } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUserData, isLoading: sessionPending } = useQuery({
    queryKey: ['session'],
    queryFn: fetchUserSession
  });

  const router = useRouter();

  if (!currentUserData?.data?.user && !sessionPending) {
    console.log("No user session found in dashboard, redirecting to login");
    router.navigate({ to: "/login" });
  }

  if (currentUserData?.data?.user && (!currentUserData?.data?.user.year || !currentUserData?.data?.user.major || !currentUserData?.data?.user.birthdate) && !sessionPending) {
    console.log("Detected user has not completed account setup, redirecting to register_final_setup");
    router.navigate({ to: "/register_final_setup" });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <FindRoomButton />
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome back, {currentUserData?.data?.user?.username || "User"}!</p>
      </div>
    </div>
  );
}
