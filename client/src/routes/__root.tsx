import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

function RootComponent() {
  const { data: session } = authClient.useSession();

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Outlet />
        <Toaster />
      </div>
      {/* <TanstackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      /> */}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
