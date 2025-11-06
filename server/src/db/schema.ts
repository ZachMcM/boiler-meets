import {
  pgTable,
  text,
  timestamp,
  boolean,
  date,
  uuid,
  serial,
  json,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const genderTypes = pgEnum("gender_types", ["male", "female"]);

// TODO Miles you'll know what this needs to be I can't really tell rn
const WEIGHTS_LENGTH = 0;

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  lastPasswordReset: timestamp("last_password_reset").default(new Date(0)),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  birthdate: date("birthdate"),
  major: text("major"),
  year: text("year"),
  bio: text("bio"),
  gender: genderTypes().notNull().default("male"),
  preference: genderTypes().notNull().default("female"),
  profile: json("profile").default({}),
  notifications: text("notifications").default('[]'),
  isBanned: boolean("is_banned").default(false),
  matchesWeights: json()
    .$type<{strengths: number, weights: number[]}>()
    .default({strengths: 0, weights: []})
    .notNull(),
  preferences: json("preferences") // user's interests like "Friends", "Romance", etc
    .$type<string[]>()
    .default([])
    .notNull(),
  nicknames: json()
    .$type<Record<string, string>>()
    .default({}),
  blockedUsers: json()
    .$type<string[]>()
    .default([]),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  first: text("first")
    .notNull()
    .references(() => user.id),
  second: text("second")
    .notNull()
    .references(() => user.id),
  matchType: text("match_type").notNull().default("friend"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportInvestigationSeverity = pgEnum(
  "report_investigation_severity",
  ["none", "low", "medium", "high", "ban"]
);

export const report = pgTable("report", {
  id: serial("id").primaryKey(),
  incomingUserId: text("incoming_user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  outgoingUserId: text("outgoing_user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  submissionDetails: text("submission_details").notNull(),
  audioFileUrl: text("audio_file_url").notNull(),
});

export const reportInvestigations = pgTable("report_investigations", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => report.id, { onDelete: "cascade" })
    .notNull(),
  aiTranscription: text("ai_transcription").notNull(),
  botComments: text("bot_comments").notNull(),
  severity: reportInvestigationSeverity().notNull(),
});

export const profileReactions = pgTable("profile_reactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  profileOwnerId: text("profile_owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetId: text("target_id").notNull(),
  targetType: text("target_type").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const callHistory = pgTable("call_history", {
  id: serial("id").primaryKey(),
  callerUserId: text("caller_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  calledUserId: text("called_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  callType: text("call_type").notNull(), // "friend" or "romantic"
  callTimestamp: timestamp("call_timestamp").defaultNow().notNull(),
  callDuration: integer("call_duration").notNull(), // in milliseconds
  wasMatched: boolean("was_matched").default(false).notNull(),
});
