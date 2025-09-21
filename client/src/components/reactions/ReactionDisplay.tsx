import type { Reaction } from '@/types';
import { cn } from '@/lib/utils';

interface ReactionDisplayProps {
  reactions: Reaction[];
  onRemoveReaction?: (reactionId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function ReactionDisplay({
  reactions,
  onRemoveReaction,
  currentUserId,
  className,
}: ReactionDisplayProps) {
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
        const isUserReaction = reactionList.some((r) => r.userId === currentUserId);

        return (
          <button
            key={emoji}
            onClick={() => {
              if (isUserReaction && onRemoveReaction) {
                const userReaction = reactionList.find((r) => r.userId === currentUserId);
                if (userReaction) {
                  onRemoveReaction(userReaction.id);
                }
              }
            }}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all",
              isUserReaction
                ? "bg-primary/20 border border-primary hover:bg-primary/30"
                : "bg-muted hover:bg-muted/80",
              onRemoveReaction && isUserReaction && "cursor-pointer"
            )}
            disabled={!onRemoveReaction || !isUserReaction}
          >
            <span>{emoji}</span>
            <span className="text-xs font-medium">
              {reactionList.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}