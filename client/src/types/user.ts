import type { NotificationItem } from "@/components/Notification";


export type User = {
  id: string
  username: string
  image: string | null
  name: string,
  major: string | null
  year: string | null
  profile: any | null
  notifications: NotificationItem[]
  preferences?: string | string[]
}

export type Match = {
  matchId: number;
  matchedUserId: string;
  matchType: "friend" | "romantic";
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    image: string | null;
    major: string | null;
    year: string | null;
    bio: string | null;
    preferences?: string | string[];
  };
};

export type Reaction = {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  targetId: string;
  targetType: 'bio' | 'module';
  timestamp: Date;
};