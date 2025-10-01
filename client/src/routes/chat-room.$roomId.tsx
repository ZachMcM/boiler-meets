import { createFileRoute } from '@tanstack/react-router'
import { ChatRoom } from '@/components/ChatRoom'

export const Route = createFileRoute('/chat-room/$roomId')({
  component: () => {
    const { roomId } = Route.useParams()
    return <ChatRoom roomId={roomId} />
  },
})