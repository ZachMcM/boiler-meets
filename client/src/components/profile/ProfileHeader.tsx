import type { User } from '@/types';
import { MapPin, Calendar, GraduationCap } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-b from-primary/10 to-background">
      <div className="relative">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
        />
        {user.isOnline && (
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-background" />
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{user.name}</h1>

        <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span>{user.major}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{user.year}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>West Lafayette, IN</span>
        </div>
      </div>
    </div>
  );
}