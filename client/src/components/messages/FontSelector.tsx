import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FontSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const AVAILABLE_FONTS = [
  // Professional Fonts
  { value: 'sans', label: 'Sans Serif', className: 'font-sans' },
  { value: 'serif', label: 'Serif', className: 'font-serif' },
  { value: 'mono', label: 'Monospace', className: 'font-mono' },
  { value: 'font-georgia', label: 'Georgia', className: 'font-georgia' },
  { value: 'font-retro', label: 'Retro', className: 'font-retro' },
  
  // Fun & Wacky Fonts
  { value: 'font-comic', label: 'Comic Sans', className: 'font-comic' },
  { value: 'font-papyrus', label: 'Papyrus', className: 'font-papyrus' },
  { value: 'font-impact', label: 'IMPACT', className: 'font-impact' },
  { value: 'font-wingdings', label: 'Wingdings', className: 'font-wingdings' },
  { value: 'font-chalk', label: 'Chalk Board', className: 'font-chalk' },
  { value: 'font-algerian', label: 'Algerian', className: 'font-algerian' },
  { value: 'font-bradley', label: 'B-Hand', className: 'font-bradley' },
];

export function FontSelector({ value, onValueChange }: FontSelectorProps) {
  return (
        <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-32 h-9">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <div style={{ maxHeight: '300px', overflowY: 'auto'}}>
                {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                    <span className={font.className}>{font.label}</span>
                </SelectItem>
                ))}
            </div>
        </SelectContent>
        </Select>
  );
}
