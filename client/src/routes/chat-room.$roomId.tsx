import { createFileRoute } from '@tanstack/react-router'
import { ChatRoom } from '@/components/ChatRoom'

export const Route = createFileRoute('/chat-room/$roomId')({
  component: () => <ChatRoom />,
})