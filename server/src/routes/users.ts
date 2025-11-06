// users.ts
import { Router } from "express";
import { authMiddleware } from "../middleware";
import { db } from "../db";
import { eq, inArray, sql, and, like, ilike, or } from "drizzle-orm";
import { user, matches, profileReactions } from "../db/schema";
import { updateUserBiases } from "../lib/algorithm";

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
        preferences: user.preferences, // include user preferences for display
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
      bio: user.bio,  // make sure this is included
      birthdate: user.birthdate,
      profile: user.profile,
      preferences: user.preferences,
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

    // Update user weights for the matching algorithm

    updateUserBiases(firstUserId, secondUserId);
    updateUserBiases(secondUserId, firstUserId);

    // Sending notifications Addition, replacement for its location in ChatRoom.tsx
    // Putting it here fixes a problem with not being able to invalidate another user's 
    // session query after unmatching them from the dashboard while they are online, which
    // in turn fixes a bug where another user drops that notification (and potential 
    // others like it) if they did not refresh twice.
    const firstUser = await db
      .select({
        name: user.name,
        notifications: user.notifications 
      })
      .from(user)
      .where(eq(user.id, firstUserId))
      .limit(1);

    if (!firstUser || firstUser.length === 0) {
      return res.status(404).json({ error: "First user notifications not found" });
    }

    const secondUser = await db
      .select({ 
        name: user.name,
        notifications: user.notifications 
      })
      .from(user)
      .where(eq(user.id, secondUserId))
      .limit(1);

    if (!secondUser || secondUser.length === 0) {
      return res.status(404).json({ error: "Second user notifications not found" });
    }

    // Prepare and add notification
    let firstNotifications = [];
    try {
      firstNotifications = JSON.parse(firstUser[0].notifications || '[]');
    } catch (e) {
      console.error("Error parsing notifications:", e);
      firstNotifications = [];
    }

    firstNotifications.push({
      timestamp: Date.now(),
      type: matchType,
      text: `${secondUser[0].name} has matched with you`,
      title: "New Match!"
    });

    let secondNotifications = [];
    try {
      secondNotifications = JSON.parse(secondUser[0].notifications || '[]');
    } catch (e) {
      console.error("Error parsing notifications:", e);
      secondNotifications = [];
    }

    secondNotifications.push({
      timestamp: Date.now(),
      type: matchType,
      text: `${firstUser[0].name} has matched with you`,
      title: "New Match!"
    });

    // Update notifications
    await db
      .update(user)
      .set({ notifications: JSON.stringify(firstNotifications) })
      .where(eq(user.id, firstUserId));

    await db
      .update(user)
      .set({ notifications: JSON.stringify(secondNotifications) })
      .where(eq(user.id, secondUserId));

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
        preferences: user.preferences,
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

// Get current user's nicknames
usersRoute.get("/user/nicknames", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;

    const currentUser = await db
      .select({ nicknames: user.nicknames })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    // Parse and return nicknames
    let nicknames: Record<string, string> = {};
    if (currentUser[0].nicknames) {
      nicknames = typeof currentUser[0].nicknames === 'string'
        ? JSON.parse(currentUser[0].nicknames)
        : currentUser[0].nicknames as Record<string, string>;
    }

    res.json(nicknames);
  } catch (error) {
    console.error("get nicknames error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Set or update a nickname for another user
usersRoute.put("/user/nickname", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { targetUserId, nickname } = req.body;

    if (!targetUserId || !nickname) {
      return res.status(400).json({ error: "missing targetUserId or nickname" });
    }

    // Get current user's nicknames
    const currentUser = await db
      .select({ nicknames: user.nicknames })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    // Parse existing nicknames
    let nicknames: Record<string, string> = {};
    if (currentUser[0].nicknames) {
      nicknames = typeof currentUser[0].nicknames === 'string'
        ? JSON.parse(currentUser[0].nicknames)
        : currentUser[0].nicknames as Record<string, string>;
    }

    // Update or add the nickname
    nicknames[targetUserId] = nickname;

    // Save back to database
    await db
      .update(user)
      .set({ nicknames: nicknames })
      .where(eq(user.id, userId as string));

    res.json({ success: true, nicknames });
  } catch (error) {
    console.error("set nickname error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Remove a nickname for another user
usersRoute.delete("/user/nickname/:targetUserId", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ error: "missing targetUserId" });
    }

    // Get current user's nicknames
    const currentUser = await db
      .select({ nicknames: user.nicknames })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    // Parse existing nicknames
    let nicknames: Record<string, string> = {};
    if (currentUser[0].nicknames) {
      nicknames = typeof currentUser[0].nicknames === 'string'
        ? JSON.parse(currentUser[0].nicknames)
        : currentUser[0].nicknames as Record<string, string>;
    }

    // Remove the nickname
    delete nicknames[targetUserId];

    // Save back to database
    await db
      .update(user)
      .set({ nicknames: nicknames })
      .where(eq(user.id, userId as string));

    res.json({ success: true, nicknames });
  } catch (error) {
    console.error("remove nickname error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Block a user
usersRoute.post("/user/block", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "missing targetUserId" });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: "cannot block yourself" });
    }

    // Get current user's blocked users
    const currentUser = await db
      .select({ blockedUsers: user.blockedUsers, name: user.name })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    // Parse existing blocked users
    let blockedUsers: string[] = [];
    if (currentUser[0].blockedUsers) {
      blockedUsers = typeof currentUser[0].blockedUsers === 'string'
        ? JSON.parse(currentUser[0].blockedUsers)
        : currentUser[0].blockedUsers as string[];
    }

    // Check if already blocked
    if (blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ error: "user already blocked" });
    }

    // Add to blocked users
    blockedUsers.push(targetUserId);

    // Save back to database
    await db
      .update(user)
      .set({ blockedUsers: blockedUsers })
      .where(eq(user.id, userId as string));

    // Check if users are matched and unmatch them if so
    const existingMatch = await db
      .select()
      .from(matches)
      .where(
        or(
          and(
            eq(matches.first, userId as string),
            eq(matches.second, targetUserId)
          ),
          and(
            eq(matches.first, targetUserId),
            eq(matches.second, userId as string)
          )
        )
      )
      .limit(1);

    if (existingMatch.length > 0) {
      // Delete the match
      await db
        .delete(matches)
        .where(
          or(
            and(
              eq(matches.first, userId as string),
              eq(matches.second, targetUserId)
            ),
            and(
              eq(matches.first, targetUserId),
              eq(matches.second, userId as string)
            )
          )
        );

      // Send notification to the blocked user
      const otherUser = await db
        .select({ notifications: user.notifications })
        .from(user)
        .where(eq(user.id, targetUserId))
        .limit(1);

      if (otherUser && otherUser.length > 0) {
        let notifications = [];
        try {
          notifications = JSON.parse(otherUser[0].notifications || '[]');
        } catch (e) {
          console.error("Error parsing notifications:", e);
          notifications = [];
        }

        notifications.push({
          timestamp: Date.now(),
          type: "unmatch",
          text: `${currentUser[0].name} has unmatched with you`,
          title: "Unmatch"
        });

        await db
          .update(user)
          .set({ notifications: JSON.stringify(notifications) })
          .where(eq(user.id, targetUserId));
      }
    }

    res.json({ success: true, blockedUsers, wasMatched: existingMatch.length > 0 });
  } catch (error) {
    console.error("block user error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Unblock a user
usersRoute.delete("/user/block/:targetUserId", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ error: "missing targetUserId" });
    }

    // Get current user's blocked users
    const currentUser = await db
      .select({ blockedUsers: user.blockedUsers })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    // Parse existing blocked users
    let blockedUsers: string[] = [];
    if (currentUser[0].blockedUsers) {
      blockedUsers = typeof currentUser[0].blockedUsers === 'string'
        ? JSON.parse(currentUser[0].blockedUsers)
        : currentUser[0].blockedUsers as string[];
    }

    // Remove from blocked users
    blockedUsers = blockedUsers.filter(id => id !== targetUserId);

    // Save back to database
    await db
      .update(user)
      .set({ blockedUsers: blockedUsers })
      .where(eq(user.id, userId as string));

    res.json({ success: true, blockedUsers });
  } catch (error) {
    console.error("unblock user error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Get blocked users list
usersRoute.get("/user/blocked", authMiddleware, async (_req, res) => {
  try {
    const userId = res.locals.userId;

    const currentUser = await db
      .select({ blockedUsers: user.blockedUsers })
      .from(user)
      .where(eq(user.id, userId as string))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    let blockedUsers: string[] = [];
    if (currentUser[0].blockedUsers) {
      blockedUsers = typeof currentUser[0].blockedUsers === 'string'
        ? JSON.parse(currentUser[0].blockedUsers)
        : currentUser[0].blockedUsers as string[];
    }

    // Get user details for blocked users
    if (blockedUsers.length === 0) {
      return res.json([]);
    }

    const blockedUserDetails = await db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(inArray(user.id, blockedUsers));

    res.json(blockedUserDetails);
  } catch (error) {
    console.error("get blocked users error:", error);
    res.status(500).json({ error: "server error" });
  }
});