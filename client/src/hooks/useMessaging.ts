import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@/types';

interface UseMessagingProps {
  userId: string;
  otherUserId: string;
}

interface UseMessagingReturn {
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  markAsRead: () => void;
}

export function useMessaging({ userId, otherUserId }: UseMessagingProps): UseMessagingReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!userId || !otherUserId) return;

    const socket = io(`${import.meta.env.VITE_SERVER_URL}/messaging`, {
      auth: { userId },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to messaging namespace');

      // Join conversation room
      socket.emit('join-conversation', otherUserId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from messaging namespace');
    });

    // Listen for message sent confirmation
    socket.on('message-sent', (message: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: message.id.toString(),
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          timestamp: new Date(message.timestamp),
          isRead: message.isRead,
          isEdited: message.isEdited || false,
          editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
        },
      ]);
    });

    // Listen for incoming messages
    socket.on('message-received', (message: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: message.id.toString(),
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          timestamp: new Date(message.timestamp),
          isRead: message.isRead,
          isEdited: message.isEdited || false,
          editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
        },
      ]);

      // Auto-mark as read since user is viewing the conversation
      socket.emit('mark-as-read', { otherUserId: message.senderId });
    });

    // Listen for typing indicator
    socket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === otherUserId) {
        setIsTyping(data.isTyping);

        // Clear typing after 3 seconds if still showing
        if (data.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    });

    // Listen for message edited
    socket.on('message-edited', (message: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id.toString()
            ? {
                ...msg,
                content: message.content,
                isEdited: message.isEdited,
                editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
              }
            : msg
        )
      );
    });

    // Listen for messages read confirmation
    socket.on('messages-read', () => {
      // Update local messages to mark them as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === userId && msg.receiverId === otherUserId
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    // Listen for errors
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, otherUserId]);

  // Fetch message history from API
  useEffect(() => {
    if (!userId || !otherUserId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/messages/${otherUserId}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();

        setMessages(
          data.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            timestamp: new Date(msg.createdAt),
            isRead: msg.isRead,
            isEdited: msg.isEdited,
            editedAt: msg.editedAt ? new Date(msg.editedAt) : undefined,
          }))
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, otherUserId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !content.trim()) return;

      socketRef.current.emit('send-message', {
        receiverId: otherUserId,
        content: content.trim(),
      });
    },
    [otherUserId]
  );

  const startTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { receiverId: otherUserId });
  }, [otherUserId]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('stop-typing', { receiverId: otherUserId });
  }, [otherUserId]);

  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (!socketRef.current || !newContent.trim()) return;

      socketRef.current.emit('edit-message', {
        messageId: parseInt(messageId),
        content: newContent.trim(),
      });
    },
    []
  );

  const markAsRead = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('mark-as-read', { otherUserId });
  }, [otherUserId]);

  return {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    editMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
