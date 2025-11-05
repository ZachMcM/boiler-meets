// users.ts
import { Router } from "express";
import { authMiddleware } from "../middleware";
import { db } from "../db";
import { eq, inArray, sql, and, like, ilike, or } from "drizzle-orm";
import { user, matches, profileReactions } from "../db/schema";

export const usersRoute = Router();

// Search users endpoint with pagination
usersRoute.get("/users/search", authMiddleware, async (req, res) => {
  try {
    const { q, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const offset = (pageNum - 1) * pageSize;
    
    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    // Search by name or username, excluding sensitive info
    const users = await db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        major: user.major,
        year: user.year,
        bio: user.bio,
      })
      .from(user)
      .where(
        sql`(${user.name} ILIKE ${`%${q}%`} OR ${user.username} ILIKE ${`%${q}%`}) AND ${user.id} != ${res.locals.userId}`
      )
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ 
        count: sql<number>`count(*)::int`
      })
      .from(user)
      .where(
        sql`(${user.name} ILIKE ${`%${q}%`} OR ${user.username} ILIKE ${`%${q}%`}) AND ${user.id} != ${res.locals.userId}`
      );

    res.json({
      users,
      pagination: {
        total: count,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error("search users error:", error);
    res.status(500).json({ error: "server error" });
  }
});

usersRoute.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const userResult = await db.query.user.findFirst({
      where: eq(user.id, req.params.id),
      columns: {
        username: true,
        image: true,
        name: true,
        major: true,
        year: true,
        profile: true
      }
    });

    res.json(userResult);
  } catch (error) {
    res.status(500).json({ error: error ?? "Server Error" });
  }
});

usersRoute.get("/user/username/:username", async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(400).json({ error: "missing username" });
  try {
    const rows = await db.select({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      image: user.image,
      major: user.major,
      year: user.year,
      bio: user.bio,  // Make sure this is included
      birthdate: user.birthdate,
      profile: user.profile,
    }).from(user).where(eq(user.username, username)).limit(1);
    
    if (!rows || rows.length === 0) return res.status(404).json({ error: "user not found" });
    
    const userData: any = rows[0];
    
    // Parse the profile JSON if it exists
    if (userData.profile && typeof userData.profile === 'string') {
      try {
        userData.profile = JSON.parse(userData.profile);
      } catch (e) {
        // If parsing fails, leave it as is
      }
    }
    
    return res.json(userData);
  } catch (err) {
    console.error("get user by username error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// New endpoint to save profile data
usersRoute.put("/user/profile", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: "missing profile data" });
    }

    // Store profile as JSON string
    const profileJson = typeof profile === 'string' ? profile : JSON.stringify(profile);

    await db.update(user)
      .set({ profile: profileJson })
      .where(eq(user.id, userId!));

    res.json({ success: true });
  } catch (error) {
    console.error("save profile error:", error);
    res.status(500).json({ error: "server error" });
  }
});

usersRoute.post("/matches", authMiddleware, async (req, res) => {
  try {
    const { firstUserId, secondUserId, matchType } = req.body;

    if (!firstUserId || !secondUserId) {
      return res.status(400).json({ error: "missing userId(s)" });
    }

    if (!matchType || (matchType !== "friend" && matchType !== "romantic")) {
      return res.status(400).json({ error: "invalid or missing matchType" });
    }

    // Insert into matches table
    const newMatch = await db.insert(matches).values({
      first: firstUserId,
      second: secondUserId,
      matchType: matchType,
    }).returning();

    res.status(201).json(newMatch[0]);
  } catch (error) {
    console.error("create match error:", error);
    res.status(500).json({ error: "server error" });
  }
});

usersRoute.get("/matches", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // Get all matches where user is either first or second
    const userMatches = await db
      .select({
        matchId: matches.id,
        matchedUserId: sql<string>`CASE
          WHEN ${matches.first} = ${userId} THEN ${matches.second}
          ELSE ${matches.first}
        END`,
        matchType: matches.matchType,
        createdAt: matches.createdAt,
      })
      .from(matches)
      .where(
        sql`${matches.first} = ${userId} OR ${matches.second} = ${userId}`
      );

    // Get user details for each matched user
    const matchedUserIds = userMatches.map((m) => m.matchedUserId);
    
    if (matchedUserIds.length === 0) {
      return res.json([]);
    }

    const matchedUsers = await db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        major: user.major,
        year: user.year,
        bio: user.bio,
      })
      .from(user)
      .where(inArray(user.id, matchedUserIds));

    // Combine match data with user data
    const matchesWithUsers = userMatches.map((match) => {
      const matchedUser = matchedUsers.find(
        (u) => u.id === match.matchedUserId
      );
      return {
        ...match,
        user: matchedUser,
      };
    });

    res.json(matchesWithUsers);
  } catch (error) {
    console.error("get matches error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Delete matches between two users (unmatch)
usersRoute.delete("/matches", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { firstUserId, secondUserId, userToUnmatch } = req.body || {};

    // Allow either passing { firstUserId, secondUserId } or { userToUnmatch }
    const a = firstUserId ?? userId;
    const b = secondUserId ?? userToUnmatch;

    if (!a || !b) {
      return res.status(400).json({ error: "missing userId(s)" });
    }

    // Ensure the authenticated user is one of the participants
    if (userId !== a && userId !== b) {
      return res.status(403).json({ error: "unauthorized" });
    }

    // Get current user's name for the notification
    const currentUser = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "Current user not found" });
    }

    // Get other user's data for notification update
    const targetUserId = userId === a ? b : a;
    const otherUser = await db
      .select({ 
        notifications: user.notifications 
      })
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!otherUser || otherUser.length === 0) {
      return res.status(404).json({ error: "Other user not found" });
    }

    // Prepare and add notification
    let currentNotifications = [];
    try {
      currentNotifications = JSON.parse(otherUser[0].notifications || '[]');
    } catch (e) {
      console.error("Error parsing notifications:", e);
      currentNotifications = [];
    }

    const otherUserNotification = {
      timestamp: Date.now(),
      type: "unmatch",
      text: `${currentUser[0].name} has unmatched with you`,
      title: "Unmatch"
    };

    currentNotifications.push(otherUserNotification);

    // Update other user's notifications
    await db
      .update(user)
      .set({ notifications: JSON.stringify(currentNotifications) })
      .where(eq(user.id, targetUserId));

    // Delete any rows where the matching pair appears in either order
    await db
      .delete(matches)
      .where(
        or(
          and(
            eq(matches.first, a),
            eq(matches.second, b)
          ),
          and(
            eq(matches.first, b),
            eq(matches.second, a)
          )
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("delete match error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Get all reactions for a specific profile
usersRoute.get("/profile-reactions/:profileOwnerId", authMiddleware, async (req, res) => {
  try {
    const { profileOwnerId } = req.params;

    if (!profileOwnerId) {
      return res.status(400).json({ error: "missing profileOwnerId" });
    }

    // Get all reactions for this profile with user details
    const reactions = await db
      .select({
        id: profileReactions.id,
        emoji: profileReactions.emoji,
        userId: profileReactions.userId,
        targetId: profileReactions.targetId,
        targetType: profileReactions.targetType,
        createdAt: profileReactions.createdAt,
        userName: user.name,
      })
      .from(profileReactions)
      .leftJoin(user, eq(profileReactions.userId, user.id))
      .where(eq(profileReactions.profileOwnerId, profileOwnerId));

    res.json(reactions);
  } catch (error) {
    console.error("get profile reactions error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Add or toggle a reaction
usersRoute.post("/profile-reactions", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { profileOwnerId, targetId, targetType, emoji } = req.body;

    if (!profileOwnerId || !targetId || !targetType || !emoji) {
      return res.status(400).json({ error: "missing required fields" });
    }

    // Check if this exact reaction already exists
    const existingReaction = await db
      .select()
      .from(profileReactions)
      .where(
        and(
          eq(profileReactions.userId, userId!),
          eq(profileReactions.profileOwnerId, profileOwnerId),
          eq(profileReactions.targetId, targetId),
          eq(profileReactions.emoji, emoji)
        )
      )
      .limit(1);

    // If reaction exists, remove it (toggle off)
    if (existingReaction.length > 0) {
      await db
        .delete(profileReactions)
        .where(eq(profileReactions.id, existingReaction[0].id));

      return res.json({ action: "removed", reactionId: existingReaction[0].id });
    }

    // Otherwise, add the new reaction
    const newReaction = await db
      .insert(profileReactions)
      .values({
        userId: userId!,
        profileOwnerId,
        targetId,
        targetType,
        emoji,
      })
      .returning();

    res.status(201).json({ action: "added", reaction: newReaction[0] });
  } catch (error) {
    console.error("add profile reaction error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Delete a specific reaction
usersRoute.delete("/profile-reactions/:reactionId", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { reactionId } = req.params;

    if (!reactionId) {
      return res.status(400).json({ error: "missing reactionId" });
    }

    // Only allow users to delete their own reactions
    const reaction = await db
      .select()
      .from(profileReactions)
      .where(eq(profileReactions.id, parseInt(reactionId)))
      .limit(1);

    if (reaction.length === 0) {
      return res.status(404).json({ error: "reaction not found" });
    }

    if (reaction[0].userId !== userId) {
      return res.status(403).json({ error: "unauthorized to delete this reaction" });
    }

    await db
      .delete(profileReactions)
      .where(eq(profileReactions.id, parseInt(reactionId)));

    res.json({ success: true });
  } catch (error) {
    console.error("delete profile reaction error:", error);
    res.status(500).json({ error: "server error" });
  }
});