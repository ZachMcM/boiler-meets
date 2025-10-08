import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  placeholder = "Type a message...",
  maxLength = 500
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      onStopTyping?.();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0 && !message) {
      onStartTyping?.();
    } else if (e.target.value.length === 0) {
      onStopTyping?.();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border-t bg-background">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
          maxLength={maxLength}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground text-right">
        {message.length}/{maxLength}
      </div>
    </div>
  );
}