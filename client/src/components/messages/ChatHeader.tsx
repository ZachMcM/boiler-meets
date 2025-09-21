import type { User } from '@/types';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  user: User;
  onBack?: () => void;
  onMenuClick?: () => void;
}

export function ChatHeader({ user, onBack, onMenuClick }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-background">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{user.name}</h3>
          <p className="text-xs text-muted-foreground">
            {user.isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>
      </div>

      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="shrink-0"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}