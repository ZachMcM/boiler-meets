import { useState } from 'react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { EMOJIS } from './MessageInput';
import { Plus } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
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

export function MessageBubble({ message, isCurrentUser, onReact }: MessageBubbleProps) {
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const fontClass = fontClassMap[message.font || 'sans'] || 'font-sans';
  // const fontClass = 'font-algerian';

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[70%]',
        isCurrentUser ? 'self-end items-end' : 'self-start items-start'
      )}
    >
      <div className='flex'>
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
        {isCurrentUser && (
          <span className="text-xs text-muted-foreground">
            {message.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
}