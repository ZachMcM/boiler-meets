import { relations } from "drizzle-orm";
import { report, reportInvestigations, user } from "./schema";

// TODO as we add more tables and fields

export const userRelations = relations(user, ({ many }) => ({}));

export const reportRelations = relations(report, ({ one }) => ({
  incomingUser: one(user, {
    fields: [report.incomingUserId],
    references: [user.id],
    relationName: "incomingReports",
  }),
  outgoingUser: one(user, {
    fields: [report.outgoingUserId],
    references: [user.id],
    relationName: "outgoingReports",
  }),
  reportInvestigation: one(reportInvestigations),
}));
