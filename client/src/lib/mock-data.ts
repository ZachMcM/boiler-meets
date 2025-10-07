import type { User, Message, Reaction } from '@/types';

export const mockCurrentUser: User = {
  id: 'user1',
  name: 'Alex Johnson',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  bio: 'Computer Science major passionate about AI and machine learning. Love hiking and playing guitar in my free time.',
  major: 'Computer Science',
  year: 'Junior',
  interests: ['Machine Learning', 'Guitar', 'Hiking', 'Coffee', 'Gaming'],
  isOnline: true,
};

export const mockOtherUser: User = {
  id: 'user2',
  name: 'Sarah Chen',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  bio: 'Engineering student who loves robotics and sustainable tech. Always down for a good coffee chat or hackathon!',
  major: 'Mechanical Engineering',
  year: 'Senior',
  interests: ['Robotics', 'Sustainability', 'Photography', 'Cooking', 'Tennis'],
  isOnline: true,
};

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    content: 'Hey! I saw we matched. Your robotics projects look amazing!',
    senderId: 'user1',
    receiverId: 'user2',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
  },
  {
    id: 'msg2',
    content: 'Thank you! I noticed you\'re into ML - that\'s so cool! Have you worked on any interesting projects lately?',
    senderId: 'user2',
    receiverId: 'user1',
    timestamp: new Date(Date.now() - 3300000),
    isRead: true,
  },
  {
    id: 'msg3',
    content: 'Yeah! I\'m actually working on a computer vision project for detecting plant diseases. Would love to hear about your robotics work too',
    senderId: 'user1',
    receiverId: 'user2',
    timestamp: new Date(Date.now() - 3000000),
    isRead: true,
  },
  {
    id: 'msg4',
    content: 'That sounds fascinating! I\'m building an autonomous drone for agricultural monitoring. Maybe we could collaborate?',
    senderId: 'user2',
    receiverId: 'user1',
    timestamp: new Date(Date.now() - 2700000),
    isRead: true,
  },
  {
    id: 'msg5',
    content: 'Definitely! Want to grab coffee at the Union tomorrow and discuss?',
    senderId: 'user1',
    receiverId: 'user2',
    timestamp: new Date(Date.now() - 2400000),
    isRead: true,
  },
  {
    id: 'msg6',
    content: 'Perfect! How about 2 PM? We can meet at Starbucks',
    senderId: 'user2',
    receiverId: 'user1',
    timestamp: new Date(Date.now() - 2100000),
    isRead: false,
  },
];

export const mockReactions: Reaction[] = [
  {
    id: 'react1',
    emoji: '❤️',
    userId: 'user1',
    userName: 'Alex Johnson',
    targetId: 'bio-user2',
    targetType: 'bio',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 'react2',
    emoji: '🔥',
    userId: 'user1',
    userName: 'Alex Johnson',
    targetId: 'interest-robotics',
    targetType: 'interest',
    timestamp: new Date(Date.now() - 7000000),
  },
  {
    id: 'react3',
    emoji: '😊',
    userId: 'user2',
    userName: 'Sarah Chen',
    targetId: 'bio-user1',
    targetType: 'bio',
    timestamp: new Date(Date.now() - 6800000),
  },
];