import { relations } from "drizzle-orm";
import { user } from "./schema";

// TODO as we add more tables and fields

export const userRelations = relations(user, ({ many }) => ({

}))