import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProfileView } from '@/components/profile/ProfileView';
import { mockOtherUser, mockReactions } from '@/lib/mock-data';
import type { Reaction } from '@/types';

export const Route = createFileRoute('/demo-profile')({
  component: DemoProfileComponent,
});

function DemoProfileComponent() {
  const [reactions, setReactions] = useState<Reaction[]>(mockReactions);

  const handleReaction = (targetId: string, emoji: string) => {
    const newReaction: Reaction = {
      id: `react-${Date.now()}`,
      emoji,
      userId: 'current-user',
      userName: 'You',
      targetId,
      targetType: targetId.includes('bio') ? 'bio' : targetId.includes('interest') ? 'interest' : 'profile',
      timestamp: new Date(),
    };
    setReactions([...reactions, newReaction]);
    console.log(`Added reaction ${emoji} to ${targetId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileView
        user={mockOtherUser}
        reactions={reactions}
        onReaction={handleReaction}
      />
    </div>
  );
}