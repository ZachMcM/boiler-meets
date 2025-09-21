import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[70%]',
        isCurrentUser ? 'self-end items-end' : 'self-start items-start'
      )}
    >
      <div
        className={cn(
          'px-4 py-2 rounded-2xl break-words',
          isCurrentUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      <div className="flex items-center gap-1 px-1">
        <span className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
        {isCurrentUser && (
          <span className="text-xs text-muted-foreground">
            {message.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
}