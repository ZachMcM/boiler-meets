import type { User, Reaction } from '@/types';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { Heart, Coffee, Music, Book, Camera, Gamepad2 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  reactions?: Reaction[];
  onReaction?: (targetId: string, emoji: string) => void;
}

export function ProfileView({ user, reactions = [], onReaction }: ProfileViewProps) {
  const getReactionsForSection = (sectionId: string) => {
    return reactions.filter((r) => r.targetId === sectionId);
  };

  const handleReaction = (sectionId: string, emoji: string) => {
    if (onReaction) {
      onReaction(sectionId, emoji);
    }
    console.log(`Reaction ${emoji} added to section ${sectionId}`);
  };

  const interestIcons: Record<string, any> = {
    'Coffee': Coffee,
    'Music': Music,
    'Gaming': Gamepad2,
    'Photography': Camera,
    'Reading': Book,
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ProfileHeader user={user} />

      <div className="px-4 space-y-4">
        <ProfileSection
          id={`bio-${user.id}`}
          title="About Me"
          reactions={getReactionsForSection(`bio-${user.id}`)}
          onReaction={(emoji) => handleReaction(`bio-${user.id}`, emoji)}
        >
          <p className="text-foreground leading-relaxed">{user.bio}</p>
        </ProfileSection>

        <ProfileSection
          id={`interests-${user.id}`}
          title="Interests"
          reactions={getReactionsForSection(`interests-${user.id}`)}
          onReaction={(emoji) => handleReaction(`interests-${user.id}`, emoji)}
        >
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => {
              const Icon = interestIcons[interest] || Heart;
              return (
                <div
                  key={interest}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{interest}</span>
                </div>
              );
            })}
          </div>
        </ProfileSection>

        <ProfileSection
          id={`details-${user.id}`}
          title="Details"
          reactions={getReactionsForSection(`details-${user.id}`)}
          onReaction={(emoji) => handleReaction(`details-${user.id}`, emoji)}
        >
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Major</dt>
              <dd className="font-medium">{user.major}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Year</dt>
              <dd className="font-medium">{user.year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">West Lafayette, IN</dd>
            </div>
          </dl>
        </ProfileSection>
      </div>
    </div>
  );
}