import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Edit2, X } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

export function MessageBubble({ message, isCurrentUser, onEditMessage }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Check if message can be edited (within 15 minutes)
  const canEdit = () => {
    if (!isCurrentUser) return false;
    const messageAge = Date.now() - new Date(message.timestamp).getTime();
    const EDIT_TIME_WINDOW = 15 * 60 * 1000; // 15 minutes
    return messageAge <= EDIT_TIME_WINDOW;
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEditMessage?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[70%]',
        isCurrentUser ? 'self-end items-end' : 'self-start items-start'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-w-[200px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
            />
            <div className="flex gap-1 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-7 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveEdit}
                className="h-7 px-2"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
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
            {showActions && canEdit() && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className={cn(
                  "absolute h-6 w-6 p-0",
                  isCurrentUser ? "-left-8 top-1" : "-right-8 top-1"
                )}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-1 px-1">
        <span className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
        {message.isEdited && (
          <span className="text-xs text-muted-foreground italic">
            (edited{message.editedAt ? ` ${formatTime(message.editedAt)}` : ''})
          </span>
        )}
        {isCurrentUser && !isEditing && (
          <span className="text-xs text-muted-foreground">
            {message.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
}