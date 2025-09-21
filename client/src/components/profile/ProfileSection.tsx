import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Reaction } from '@/types';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  reactions?: Reaction[];
  onReaction?: (emoji: string) => void;
  className?: string;
}

export function ProfileSection({
  id,
  title,
  children,
  reactions = [],
  onReaction,
  className,
}: ProfileSectionProps) {
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className={cn("relative", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onReaction && (
            <button
              onClick={() => onReaction('❤️')}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Add reaction"
            >
              <span className="text-xl">+</span>
            </button>
          )}
        </div>

        <div className="text-sm text-foreground">
          {children}
        </div>

        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <div
                key={emoji}
                className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs"
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}