import { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
  reactToMessage?: (messageId: string, emoji?: string | null) => void;
}

export function MessageList({ messages, currentUserId, className, reactToMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-8", className)}>
        <p className="text-muted-foreground text-center">
          No messages yet. Start a conversation!
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 overflow-y-auto p-4 space-y-4",
      className
    )}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
          // forward react handler if available
          // message.id is a string
          onReact={reactToMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}