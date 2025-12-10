import { Socket } from "socket.io";
import { logger } from "../logger";
import { db } from "../db";
import { messages } from "../db/schema";
import { eq, and } from "drizzle-orm";

interface MessageData {
  receiverId: string;
  content: string;
  font?: string;
}

interface TypingData {
  receiverId: string;
}

export function messagingHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string;

  if (!userId) {
    logger.warn("Socket connection rejected - no userId");
    socket.disconnect();
    return;
  }

  logger.info(`User ${userId} connected to messaging namespace`);

  // Join user's personal room for receiving messages
  socket.join(`user-${userId}`);

  // Handle joining a conversation room
  socket.on("join-conversation", (otherUserId: string) => {
    const room = getConversationRoom(userId, otherUserId);
    socket.join(room);
    logger.info(`User ${userId} joined conversation with ${otherUserId}`);
  });

  // Handle sending a message
  socket.on("send-message", async (data: MessageData) => {
    try {
      const { receiverId, content, font } = data;

      if (!receiverId || !content) {
        socket.emit("error", { message: "Missing receiverId or content" });
        return;
      }

      // Validate content
      if (typeof content !== "string" || content.trim().length === 0) {
        socket.emit("error", { message: "Content must be a non-empty string" });
        return;
      }

      if (content.length > 5000) {
        socket.emit("error", { message: "Content too long (max 5000 characters)" });
        return;
      }

      // Save message to database
      const newMessage = await db
        .insert(messages)
        .values({
          senderId: userId,
          receiverId,
          content: content.trim(),
          font: font,
        })
        .returning();

      const savedMessage = newMessage[0];

      // Emit to sender (confirmation)
      socket.emit("message-sent", {
        id: savedMessage.id,
        senderId: savedMessage.senderId,
        receiverId: savedMessage.receiverId,
        content: savedMessage.content,
        font: savedMessage.font,
        reaction: savedMessage.reaction,
        isRead: savedMessage.isRead,
        timestamp: savedMessage.createdAt,
      });

      // Emit to receiver (if they're online)
      socket.to(`user-${receiverId}`).emit("message-received", {
        id: savedMessage.id,
        senderId: savedMessage.senderId,
        receiverId: savedMessage.receiverId,
        content: savedMessage.content,
        font: savedMessage.font,
        reaction: savedMessage.reaction,
        isRead: savedMessage.isRead,
        timestamp: savedMessage.createdAt,
      });

      logger.info(`Message ${savedMessage.id} sent from ${userId} to ${receiverId}`);
    } catch (error) {
      logger.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data: TypingData) => {
    const { receiverId } = data;
    if (receiverId) {
      socket.to(`user-${receiverId}`).emit("user-typing", {
        userId,
        isTyping: true,
      });
    }
  });

  // Handle stop typing
  socket.on("stop-typing", (data: TypingData) => {
    const { receiverId } = data;
    if (receiverId) {
      socket.to(`user-${receiverId}`).emit("user-typing", {
        userId,
        isTyping: false,
      });
    }
  });

  // Handle marking messages as read
  socket.on("mark-as-read", async (data: { otherUserId: string }) => {
    try {
      const { otherUserId } = data;

      // Mark all messages from otherUserId to current user as read
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, userId),
            eq(messages.isRead, false)
          )
        );

      // Notify the other user that their messages were read
      socket.to(`user-${otherUserId}`).emit("messages-read", {
        userId,
      });

      logger.info(`Messages from ${otherUserId} to ${userId} marked as read`);
    } catch (error) {
      logger.error("Error marking messages as read:", error);
    }
  });

  // Handle reacting to a message (only receiver allowed to react)
  socket.on("react-message", async (data: { messageId: number; emoji?: string | null }) => {
    try {
      const { messageId, emoji } = data;

      if (!messageId) {
        socket.emit("error", { message: "missing messageId" });
        return;
      }

      // Fetch message to verify the receiver
      const msgRes = await db
        .select({ id: messages.id, senderId: messages.senderId, receiverId: messages.receiverId, content: messages.content, reaction: messages.reaction, font: messages.font, isRead: messages.isRead, createdAt: messages.createdAt })
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!msgRes || msgRes.length === 0) {
        socket.emit("error", { message: "message not found" });
        return;
      }

      const msg = msgRes[0];

      // only the receiver may react to the message
      if (msg.receiverId !== userId) {
        socket.emit("error", { message: "forbidden" });
        return;
      }

      // Update reaction in DB
      const updated = await db
        .update(messages)
        .set({ reaction: emoji || null })
        .where(eq(messages.id, messageId))
        .returning();

      const updatedMsg = updated[0];

      // Notify both participants that the message was updated
      socket.emit("message-updated", {
        id: updatedMsg.id,
        senderId: updatedMsg.senderId,
        receiverId: updatedMsg.receiverId,
        content: updatedMsg.content,
        font: updatedMsg.font,
        reaction: updatedMsg.reaction,
        isRead: updatedMsg.isRead,
        timestamp: updatedMsg.createdAt,
      });

      socket.to(`user-${updatedMsg.senderId}`).emit("message-updated", {
        id: updatedMsg.id,
        senderId: updatedMsg.senderId,
        receiverId: updatedMsg.receiverId,
        content: updatedMsg.content,
        font: updatedMsg.font,
        reaction: updatedMsg.reaction,
        isRead: updatedMsg.isRead,
        timestamp: updatedMsg.createdAt,
      });

    } catch (error) {
      logger.error("Error reacting to message:", error);
      socket.emit("error", { message: "Failed to react to message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    logger.info(`User ${userId} disconnected from messaging namespace`);
  });
}

// Helper function to create a consistent conversation room name
function getConversationRoom(userId1: string, userId2: string): string {
  // Sort IDs to ensure same room name regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `conversation-${sortedIds[0]}-${sortedIds[1]}`;
}
