import { authClient } from '@/lib/auth-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent
})

function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome back, {session?.user?.username || 'User'}!</p>
    </div>
  )
}
