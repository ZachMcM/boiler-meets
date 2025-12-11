import { useState } from 'react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { EMOJIS } from './MessageInput';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Check, Edit2, X } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onReact?: (messageId: string, emoji?: string | null) => void;
}

const fontClassMap: Record<string, string> = {
  // Professional
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  'font-georgia': 'font-georgia',
  'font-retro': 'font-retro',
  
  // Fun & Wacky
  'font-comic': 'font-comic',
  'font-papyrus': 'font-papyrus',
  'font-impact': 'font-impact',
  'font-wingdings': 'font-wingdings',
  'font-chalk': 'font-chalk',
  'font-algerian': 'font-algerian',
  'font-bradley': 'font-bradley',
};

export function MessageBubble({ message, isCurrentUser, onEditMessage, onReact }: MessageBubbleProps) {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const handleReact = async (emoji: string | null) => {
    try {
      // Prefer socket hook handler if provided
      if (typeof (onReact as any) === 'function') {
        onReact?.(message.id, emoji);
        setIsEmojiOpen(false);
        return;
      }

      // Fallback to REST endpoint
      await fetch(`${import.meta.env.VITE_SERVER_URL}/messages/${message.id}/reaction`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      setIsEmojiOpen(false);
    } catch (err) {
      console.error('Failed to set reaction', err);
    }
  };

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

  const fontClass = fontClassMap[message.font || 'sans'] || 'font-sans';
  // const fontClass = 'font-algerian';
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
            fontClass,
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
        <div className="flex flex-col">
          {message.imageUrl && (
            <div className="mb-2">
              <img
                src={message.imageUrl}
                alt="sent image"
                className="max-w-xs max-h-60 rounded-md object-cover cursor-pointer"
                onClick={() => window.open(message.imageUrl || '', '_blank')}
              />
            </div>
          )}
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
        </div>
        {/* Reaction display */}
        {message.reaction && (
            <span className="ml-2 text-lg leading-none translate-y-[-8px] translate-x-[-18px]" aria-label="reaction">{message.reaction}</span>
        )}
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
        <span className="text-xs text-muted-foreground flex">
          {formatTime(message.timestamp)}
                  {/* Reaction picker for messages the current user received (i.e., not their own sent messages) */}
          {!isCurrentUser && (
            <div>
              <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" type="button" className="h-4 w-4 p-0 mx-3">
                    {/* <span className="text-xs">😀</span> */}
                    <Plus></Plus>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="start">
                  <div className="grid grid-cols-10 gap-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(emoji)}
                        className="text-2xl p-1 hover:bg-accent rounded transition-transform hover:scale-110 flex items-center justify-center"
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => handleReact(null)}
                      className="col-span-10 mt-2 text-xs p-2 bg-muted rounded"
                      type="button"
                    >
                      Clear reaction
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
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