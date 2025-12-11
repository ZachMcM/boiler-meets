import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Image as ImageIcon, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FontSelector } from './FontSelector';
import { ImageGallery } from './ImageGallery';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string | null, font?: string, imageUrl?: string | null) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  placeholder?: string;
  maxLength?: number;
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

export const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✌️', '🤞', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐',
  '💪', '🦾', '🖕', '✍️', '🤳', '💅', '🦵', '🦿', '🦶', '👣',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '🔥', '⭐', '🌟', '✨', '⚡', '💥', '💯', '✅', '❌', '⚠️',
];

export function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  placeholder = "Type a message...",
  maxLength = 500
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFont, setSelectedFont] = useState('sans');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSend = () => {
    const hasText = message.trim().length > 0;
    const hasImage = !!previewUrl;

    if (!hasText && !hasImage) return;

    const contentToSend = hasText ? message.trim() : null;
    onSendMessage(contentToSend, selectedFont, previewUrl ?? null);

    setMessage('');
    setPreviewUrl(null);
    onStopTyping?.();
  };

  const handleImageSelect = async (file?: File) => {
    try {
      const selected = file;
      if (!selected) return;
      setUploading(true);

      const form = new FormData();
      form.append('image', selected, selected.name);

      const resp = await fetch(`${import.meta.env.VITE_SERVER_URL}/images/upload`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      if (!resp.ok) {
        throw new Error('Image upload failed');
      }

      const data = await resp.json();
      const imageUrl = data.imageUrl;
      setPreviewUrl(imageUrl);
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploading(false);
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

  const handleEmojiClick = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || message.length;
    const end = input.selectionEnd || message.length;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);

    setMessage(newMessage);
    setIsEmojiOpen(false);

    setTimeout(() => {
      input.focus();
      const newCursorPos = start + emoji.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const removePreview = () => {
    setPreviewUrl(null);
  };

  const handleSelectFromGallery = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    setIsImageMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 border-t bg-background">
      <div className="flex gap-2">
        <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              type="button"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="start">
            <div className="grid grid-cols-10 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl p-2 hover:bg-accent rounded transition-transform hover:scale-125 flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={cn("flex-1", (fontClassMap[selectedFont || 'sans'] || 'font-sans'))}
          maxLength={maxLength}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageSelect(f);
          }}
        />
        <Popover open={isImageMenuOpen} onOpenChange={setIsImageMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              title="Select image"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <ImageGallery
              onSelectImage={handleSelectFromGallery}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          </PopoverContent>
        </Popover>
        <FontSelector value={selectedFont} onValueChange={setSelectedFont} />
        <Button
          onClick={handleSend}
          disabled={!message.trim() && !previewUrl}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {previewUrl && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={previewUrl} alt="attachment preview" className="h-24 w-24 object-cover rounded" />
            <button
              type="button"
              onClick={removePreview}
              className="absolute -top-1 -right-1 bg-black/60 text-white rounded-full p-1"
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploading ? <div className="text-sm text-muted-foreground">Uploading...</div> : null}
        </div>
      )}
      <div className="text-xs text-muted-foreground text-right">
        {message.length}/{maxLength}
      </div>
    </div>
  );
}