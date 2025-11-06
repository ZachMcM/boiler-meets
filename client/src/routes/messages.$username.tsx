import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessageList } from '@/components/messages/MessageList';
import { MessageInput } from '@/components/messages/MessageInput';
import { authClient } from '@/lib/auth-client';
import { useMessaging } from '@/hooks/useMessaging';
import type { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

export const Route = createFileRoute('/messages/$username')({
  component: MessagesComponent,
});

// Helper function to fetch user by username
async function getUserByUsername(username: string) {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/user/username/${username}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

function MessagesComponent() {
  const { username } = Route.useParams();
  const router = useRouter();
  const { data: currentUserData } = authClient.useSession();

  // Fetch the other user's data
  const { data: otherUser, isLoading: isLoadingOtherUser } = useQuery({
    queryKey: ['user-by-username', username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });

  // Helper function to get display name (nickname or real name)
  const getDisplayName = (u?: { id?: string; name?: string } | null) => {
    try {
      // authClient.useSession() returns { data: { user, session } }
      const sessionUser = currentUserData?.data?.user || currentUserData?.user;
      if (!sessionUser) return u?.name || "Anonymous";
      const raw = (sessionUser as any)?.nicknames;
      if (!u) return "Anonymous";
      if (!raw) return u.name || "Anonymous";
      let mapping: Record<string, string> = {};
      if (typeof raw === "string") mapping = JSON.parse(raw || "{}");
      else mapping = raw as Record<string, string>;
      return (u.id && mapping[u.id]) ? mapping[u.id] : (u.name || "Anonymous");
    } catch (error) {
      console.error("Error getting display name:", error);
      return u?.name || "Anonymous";
    }
  };

  // Use real-time messaging hook
  const {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    startTyping,
    stopTyping,
  } = useMessaging({
    userId: currentUserData?.user?.id || '',
    otherUserId: otherUser?.id || '',
  });

  const handleSendMessage = (content: string) => {
    sendMessage(content);
    stopTyping();
  };

  const handleBack = () => {
    router.navigate({ to: '/dashboard' });
  };

  const handleViewProfile = () => {
    router.navigate({ to: `/profile/${username}` });
  };

  if (isLoadingOtherUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  // Convert database user to component User type
  const otherUserFormatted: User = {
    id: otherUser.id,
    name: getDisplayName(otherUser),
    avatar: otherUser.image,
    bio: otherUser.bio || '',
    major: otherUser.major || 'Undeclared',
    year: (otherUser.year as any) || 'Freshman',
    interests: [],
    isOnline: true,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <ChatHeader
          user={otherUserFormatted}
          onBack={handleBack}
          onMenuClick={undefined}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleViewProfile}
              className="hover:cursor-pointer"
            >
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isTyping && (
        <div className="px-4 py-2 text-sm text-muted-foreground italic">
          {getDisplayName(otherUser)} is typing...
        </div>
      )}

      <MessageList
        messages={messages}
        currentUserId={currentUserData?.user?.id || ''}
        className="flex-1"
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
        placeholder="Type your message..."
      />

      {!isConnected && (
        <div className="px-4 py-2 text-xs text-center text-muted-foreground bg-muted">
          Connecting...
        </div>
      )}
    </div>
  );
}
