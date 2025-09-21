import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface ReactionButtonProps {
  onReaction: (emoji: string) => void;
  existingReactions?: string[];
}

const EMOJI_OPTIONS = ['❤️', '😊', '🔥', '👍', '😍', '🎉', '💯', '✨'];

export function ReactionButton({ onReaction, existingReactions = [] }: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onReaction(emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className="h-8 px-2"
      >
        <Smile className="h-4 w-4" />
      </Button>

      {showPicker && (
        <div className="absolute bottom-full mb-2 right-0 bg-card border rounded-lg shadow-lg p-2 z-50">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="p-2 hover:bg-muted rounded transition-colors text-lg"
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}