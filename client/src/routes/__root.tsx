import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { Outlet, createRootRoute } from "@tanstack/react-router";

function RootComponent() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Outlet />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
