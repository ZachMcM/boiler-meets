import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessageList } from '@/components/messages/MessageList';
import { MessageInput } from '@/components/messages/MessageInput';
import { mockMessages, mockCurrentUser, mockOtherUser } from '@/lib/mock-data';
import type { Message } from '@/types';

export const Route = createFileRoute('/demo-chat')({
  component: DemoChatComponent,
});

function DemoChatComponent() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: mockCurrentUser.id,
      receiverId: mockOtherUser.id,
      timestamp: new Date(),
      isRead: false,
    };
    setMessages([...messages, newMessage]);
    console.log('Message sent:', content);
  };

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader
        user={mockOtherUser}
        onBack={handleBack}
        onMenuClick={handleMenuClick}
      />

      <MessageList
        messages={messages}
        currentUserId={mockCurrentUser.id}
        className="flex-1"
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        placeholder="Type your message..."
      />
    </div>
  );
}