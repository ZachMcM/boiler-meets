// messages.ts
import { Router } from "express";
import { authMiddleware } from "../middleware";
import { db } from "../db";
import { eq, and, or, sql, desc } from "drizzle-orm";
import { user, messages } from "../db/schema";

export const messagesRoute = Router();

// Get unread message count (must be before parameterized routes)
messagesRoute.get("/messages/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));

    const count = Number(result[0]?.count || 0);

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("get unread count error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Get conversation with another user
messagesRoute.get("/messages/:otherUserId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = res.locals.userId;
    const { otherUserId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    if (!otherUserId) {
      return res.status(400).json({ error: "missing otherUserId" });
    }

    // Get all messages between current user and other user
    const conversation = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, currentUserId),
            eq(messages.receiverId, otherUserId)
          ),
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, currentUserId)
          )
        )
      )
      .orderBy(messages.createdAt);

    // Mark unread messages from other user as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, currentUserId),
          eq(messages.isRead, false)
        )
      );

    res.json(conversation);
  } catch (error) {
    console.error("get conversation error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Send a new message
messagesRoute.post("/messages", authMiddleware, async (req, res) => {
  try {
    const senderId = res.locals.userId;
    const { receiverId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    if (!receiverId || !content) {
      return res.status(400).json({ error: "missing receiverId or content" });
    }

    // Validate content
    if (typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "content must be a non-empty string" });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: "content too long (max 5000 characters)" });
    }

    // Create message in database
    const newMessage = await db
      .insert(messages)
      .values({
        senderId,
        receiverId,
        content: content.trim(),
      })
      .returning();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error("send message error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Get list of conversations (users you've messaged with)
messagesRoute.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // Get unique users that current user has conversed with
    const conversations = await db.execute(sql`
      SELECT DISTINCT
        CASE
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        MAX(m.created_at) as last_message_time,
        COUNT(CASE WHEN m.receiver_id = ${userId} AND m.is_read = false THEN 1 END) as unread_count
      FROM messages m
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `);

    // Get user details for each conversation
    const otherUserIds = conversations.rows.map((r: any) => r.other_user_id);

    if (otherUserIds.length === 0) {
      return res.json([]);
    }

    const users = await db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(sql`${user.id} = ANY(${otherUserIds})`);

    // Combine conversation data with user data
    const conversationsWithUsers = conversations.rows.map((conv: any) => {
      const otherUser = users.find((u) => u.id === conv.other_user_id);
      return {
        otherUser,
        lastMessageTime: conv.last_message_time,
        unreadCount: Number(conv.unread_count || 0),
      };
    });

    res.json(conversationsWithUsers);
  } catch (error) {
    console.error("get conversations error:", error);
    res.status(500).json({ error: "server error" });
  }
});
