import { Router } from "express";
import { db } from "../db";
import { recommendations, matches, user } from "../db/schema";
import { and, eq, or, desc, ne } from "drizzle-orm";
import { logger } from "../logger";
import { authMiddleware } from "../middleware";

const router = Router();

// Submit a new recommendation
router.post("/recommendations", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { recommendedUserId, recipientId, message } = req.body;

    // Validate input
    if (!recommendedUserId || !recipientId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Can't recommend to yourself or recommend yourself
    if (userId === recipientId || userId === recommendedUserId || recommendedUserId === recipientId) {
      return res.status(400).json({ error: "Invalid recommendation" });
    }

    // Check if recommender is matched with both users
    const [matchWithRecommended] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.first, userId), eq(matches.second, recommendedUserId)),
          and(eq(matches.first, recommendedUserId), eq(matches.second, userId))
        )
      );

    const [matchWithRecipient] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.first, userId), eq(matches.second, recipientId)),
          and(eq(matches.first, recipientId), eq(matches.second, userId))
        )
      );

    if (!matchWithRecommended || !matchWithRecipient) {
      return res.status(403).json({ error: "You can only recommend between your matches" });
    }

    // Check if this recommendation already exists (within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [existingRecommendation] = await db
      .select()
      .from(recommendations)
      .where(
        and(
          eq(recommendations.recommenderId, userId),
          eq(recommendations.recommendedUserId, recommendedUserId),
          eq(recommendations.recipientId, recipientId)
        )
      );

    if (existingRecommendation && existingRecommendation.createdAt > thirtyDaysAgo) {
      return res.status(400).json({ error: "You already recommended this person recently" });
    }

    // Create the recommendation
    const [newRecommendation] = await db
      .insert(recommendations)
      .values({
        recommenderId: userId,
        recommendedUserId,
        recipientId,
        message: message || null,
        status: "pending",
      })
      .returning();

    // Add notification to recipient
    const [recipient] = await db.select().from(user).where(eq(user.id, recipientId));
    const [recommended] = await db.select().from(user).where(eq(user.id, recommendedUserId));
    const [recommender] = await db.select().from(user).where(eq(user.id, userId));

    if (recipient && recommended && recommender) {
      const currentNotifications = JSON.parse(recipient.notifications || "[]");
      const newNotification = {
        timestamp: Date.now(),
        type: "recommendation",
        title: "New Recommendation!",
        text: `${recommender.name} thinks you might connect well with ${recommended.name}`,
      };

      currentNotifications.unshift(newNotification);

      await db
        .update(user)
        .set({ notifications: JSON.stringify(currentNotifications) })
        .where(eq(user.id, recipientId));
    }

    logger.info("Recommendation created", { recommenderId: userId, recommendedUserId, recipientId });
    res.status(201).json({ recommendation: newRecommendation });
  } catch (error) {
    logger.error("Error creating recommendation", { error });
    res.status(500).json({ error: "Failed to create recommendation" });
  }
});

// Get sent recommendations
router.get("/recommendations/sent", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sentRecommendations = await db
      .select({
        recommendation: recommendations,
        recommendedUser: {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
          major: user.major,
          year: user.year,
        },
        recipient: {
          id: user.id,
          name: user.name,
          username: user.username,
        },
      })
      .from(recommendations)
      .innerJoin(user, eq(user.id, recommendations.recommendedUserId))
      .where(eq(recommendations.recommenderId, userId))
      .orderBy(desc(recommendations.createdAt));

    // Group by recommendation and add recipient info
    const formattedRecommendations = [];
    for (const rec of sentRecommendations) {
      const [recipientData] = await db
        .select({
          id: user.id,
          name: user.name,
          username: user.username,
        })
        .from(user)
        .where(eq(user.id, rec.recommendation.recipientId));

      formattedRecommendations.push({
        ...rec.recommendation,
        recommendedUser: rec.recommendedUser,
        recipient: recipientData,
      });
    }

    res.json({ recommendations: formattedRecommendations });
  } catch (error) {
    logger.error("Error fetching sent recommendations", { error });
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Get received recommendations
router.get("/recommendations/received", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const receivedRecommendations = await db
      .select({
        recommendation: recommendations,
        recommendedUser: {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
          major: user.major,
          year: user.year,
          bio: user.bio,
        },
        recommender: {
          id: user.id,
          name: user.name,
          username: user.username,
        },
      })
      .from(recommendations)
      .innerJoin(user, eq(user.id, recommendations.recommendedUserId))
      .where(
        and(
          eq(recommendations.recipientId, userId),
          eq(recommendations.status, "pending")
        )
      )
      .orderBy(desc(recommendations.createdAt));

    // Add recommender info
    const formattedRecommendations = [];
    for (const rec of receivedRecommendations) {
      const [recommenderData] = await db
        .select({
          id: user.id,
          name: user.name,
          username: user.username,
        })
        .from(user)
        .where(eq(user.id, rec.recommendation.recommenderId));

      // Check if already matched
      const [existingMatch] = await db
        .select()
        .from(matches)
        .where(
          or(
            and(eq(matches.first, userId), eq(matches.second, rec.recommendedUser.id)),
            and(eq(matches.first, rec.recommendedUser.id), eq(matches.second, userId))
          )
        );

      formattedRecommendations.push({
        ...rec.recommendation,
        recommendedUser: rec.recommendedUser,
        recommender: recommenderData,
        alreadyMatched: !!existingMatch,
      });
    }

    res.json({ recommendations: formattedRecommendations });
  } catch (error) {
    logger.error("Error fetching received recommendations", { error });
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Update recommendation status (accept/decline)
router.put("/recommendations/:id/status", authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Verify the user is the recipient
    const [recommendation] = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, Number(id)));

    if (!recommendation || recommendation.recipientId !== userId) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // Update the status
    await db
      .update(recommendations)
      .set({ status })
      .where(eq(recommendations.id, Number(id)));

    res.json({ success: true });
  } catch (error) {
    logger.error("Error updating recommendation status", { error });
    res.status(500).json({ error: "Failed to update recommendation" });
  }
});

export default router;