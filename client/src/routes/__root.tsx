import { Toaster } from "@/components/ui/sonner";
import { VideoCallContextProvider } from "@/contexts/VideoCallContext";
import { authClient } from "@/lib/auth-client";
import {
  Outlet,
  createRootRoute,
  createRootRouteWithContext,
} from "@tanstack/react-router";

type SessionData = Awaited<ReturnType<typeof authClient.getSession>>["data"];

interface RouterContext {
  currentUserData?: SessionData;
}

function RootComponent() {
  return (
    <VideoCallContextProvider>
      <div className="min-h-screen flex flex-col">
        <Outlet />
        <Toaster />
      </div>
    </VideoCallContextProvider>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const { data: session } = await authClient.getSession();

    return {
      ...context,
      currentUserData: session,
    };
  },
  component: RootComponent,
});
