import { MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  activeView: 'messages' | 'profile';
  onViewChange: (view: 'messages' | 'profile') => void;
  className?: string;
}

export function ViewToggle({ activeView, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex bg-muted rounded-lg p-1", className)}>
      <button
        onClick={() => onViewChange('messages')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all",
          activeView === 'messages'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Messages</span>
      </button>

      <button
        onClick={() => onViewChange('profile')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all",
          activeView === 'profile'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">Profile</span>
      </button>
    </div>
  );
}