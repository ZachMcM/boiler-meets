// users.ts
import { Router } from "express";
import { authMiddleware } from "../middleware";
import { db } from "../db";
import { eq, inArray, sql } from "drizzle-orm";
import { user, matches } from "../db/schema";

export const usersRoute = Router();

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
      .where(eq(user.id, userId));

    res.json({ success: true });
  } catch (error) {
    console.error("save profile error:", error);
    res.status(500).json({ error: "server error" });
  }
});

usersRoute.post("/matches", authMiddleware, async (req, res) => {
  try {
    const { firstUserId, secondUserId } = req.body;

    if (!firstUserId || !secondUserId) {
      return res.status(400).json({ error: "missing userId(s)" });
    }

    // Insert into matches table
    const newMatch = await db.insert(matches).values({
      first: firstUserId,
      second: secondUserId,
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