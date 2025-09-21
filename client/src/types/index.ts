export interface User {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  major: string;
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  interests: string[];
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName?: string;
  targetId: string;
  targetType: 'profile' | 'bio' | 'interest' | 'photo';
  timestamp: Date;
}

export interface ProfileSection {
  id: string;
  type: 'bio' | 'interests' | 'details' | 'photos';
  title: string;
  content: any;
  reactions?: Reaction[];
}