import { Socket } from "socket.io";
import { logger } from "../logger";
import { db } from "../db";
import { messages } from "../db/schema";
import { eq, and } from "drizzle-orm";

interface MessageData {
  receiverId: string;
  content: string;
  font?: string;
  imageUrl?: string | null;
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
      const { receiverId, content, font, imageUrl } = data;

      if (!receiverId || (!content && !imageUrl)) {
        socket.emit("error", { message: "Missing receiverId or content/image" } as any);
        return;
      }

      if (content && (typeof content !== "string" || content.trim().length === 0)) {
        socket.emit("error", { message: "Content must be a non-empty string" } as any);
        return;
      }

      if (content && content.length > 5000) {
        socket.emit("error", { message: "Content too long (max 5000 characters)" } as any);
        return;
      }

      // Save message to database
      const newMessage = await db
        .insert(messages)
        .values({
          senderId: userId,
          receiverId,
          content: content ? content.trim() : "",
          font: font,
          imageUrl: imageUrl || null,
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
        imageUrl: savedMessage.imageUrl,
        isRead: savedMessage.isRead,
        isEdited: savedMessage.isEdited,
        editedAt: savedMessage.editedAt,
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
        imageUrl: savedMessage.imageUrl,
        isRead: savedMessage.isRead,
        isEdited: savedMessage.isEdited,
        editedAt: savedMessage.editedAt,
        timestamp: savedMessage.createdAt,
      });

      logger.info(`Message ${savedMessage.id} sent from ${userId} to ${receiverId}`);
    } catch (error) {
      logger.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" } as any);
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

  // Handle editing a message
  socket.on("edit-message", async (data: { messageId: number; content: string }) => {
    try {
      const { messageId, content } = data;

      if (!messageId || !content) {
        socket.emit("error", { message: "Missing messageId or content" });
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

      // Get the original message
      const originalMessage = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (originalMessage.length === 0) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      const message = originalMessage[0];

      // Check if user is the sender
      if (message.senderId !== userId) {
        socket.emit("error", { message: "You can only edit your own messages" });
        return;
      }

      // Check if message is within edit time window (15 minutes)
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      const EDIT_TIME_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

      if (messageAge > EDIT_TIME_WINDOW) {
        socket.emit("error", { message: "Edit time window has expired (15 minutes)" });
        return;
      }

      // Update the message
      const updatedMessage = await db
        .update(messages)
        .set({
          content: content.trim(),
          isEdited: true,
          editedAt: new Date(),
          originalContent: message.originalContent || message.content, // Store original if first edit
        })
        .where(eq(messages.id, messageId))
        .returning();

      const editedMessage = updatedMessage[0];

      // Emit to sender (confirmation)
      socket.emit("message-edited", {
        id: editedMessage.id,
        senderId: editedMessage.senderId,
        receiverId: editedMessage.receiverId,
        content: editedMessage.content,
        isRead: editedMessage.isRead,
        isEdited: editedMessage.isEdited,
        editedAt: editedMessage.editedAt,
        timestamp: editedMessage.createdAt,
      });

      // Emit to receiver (if they're online)
      socket.to(`user-${message.receiverId}`).emit("message-edited", {
        id: editedMessage.id,
        senderId: editedMessage.senderId,
        receiverId: editedMessage.receiverId,
        content: editedMessage.content,
        isRead: editedMessage.isRead,
        isEdited: editedMessage.isEdited,
        editedAt: editedMessage.editedAt,
        timestamp: editedMessage.createdAt,
      });

      logger.info(`Message ${messageId} edited by ${userId}`);
    } catch (error) {
      logger.error("Error editing message:", error);
      socket.emit("error", { message: "Failed to edit message" });
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
        .select({ id: messages.id, senderId: messages.senderId, receiverId: messages.receiverId, content: messages.content, reaction: messages.reaction, imageUrl: messages.imageUrl, font: messages.font, isRead: messages.isRead, createdAt: messages.createdAt })
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
        imageUrl: updatedMsg.imageUrl,
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
        imageUrl: updatedMsg.imageUrl,
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
