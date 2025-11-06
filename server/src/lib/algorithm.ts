import { and, eq, InferSelectModel, or } from "drizzle-orm";
import { db } from "../db";
import { report, user } from "../db/schema";
import {
  Bit,
  ModuleDef,
  ModuleMap,
  ProfileInput,
  SchemaMapEntry,
  SchemaMapLayout,
} from "../types/algorithm";

const normalizeOption = (s: string) =>
  s.trim().replace(/\s+/g, " ").toLowerCase();

const buildSchemaMap = (moduleDefs: readonly ModuleDef[]): SchemaMapLayout => {
  let runningOffset = 0;
  const entries: SchemaMapEntry[] = [];

  for (const moduleDef of moduleDefs) {
    const optionIndexByNormalized: Record<string, number> = {};

    moduleDef.options.forEach((option, index) => {
      const key = normalizeOption(option);

      if (key in optionIndexByNormalized) {
        throw new Error(
          `Duplicate option after normalization in "${moduleDef.key}": "${option}"`
        );
      }

      optionIndexByNormalized[key] = index;
    });

    entries.push({
      key: moduleDef.key,
      offset: runningOffset,
      options: moduleDef.options,
      optionIndexByNormalized,
    });

    runningOffset += moduleDef.options.length;
  }

  const modulesByKey = Object.fromEntries(
    entries.map((e) => [e.key, e])
  ) as Record<string, SchemaMapEntry>;

  return {
    totalOptionCount: runningOffset,
    entries,
    modulesByKey,
  };
};

const SCHEMA_MAP = buildSchemaMap(ModuleMap);

const globalOptionIndex = (moduleKey: string, optionText: string): number => {
  const entry = SCHEMA_MAP.modulesByKey[moduleKey];
  if (!entry || !optionText) return -1;

  const normalized = normalizeOption(optionText);
  const localIndex = entry.optionIndexByNormalized[normalized];

  return localIndex === undefined ? -1 : entry.offset + localIndex;
};

export const encodeProfile = (profile: ProfileInput): Bit[] => {
  const encoded: Bit[] = new Array(SCHEMA_MAP.totalOptionCount).fill(
    0
  ) as Bit[];
  const modules = profile?.modules ?? [];

  for (const userModule of modules) {
    const moduleKey = userModule.type;
    if (!moduleKey || !(moduleKey in SCHEMA_MAP.modulesByKey)) continue;

    const module = userModule.data?.[0];
    const selected = module?.selectedOption ?? module?.content;
    if (!selected) continue;

    const optionIndex = globalOptionIndex(moduleKey, selected);
    if (optionIndex >= 0) encoded[optionIndex] = 1;
  }

  return encoded;
};

export async function computeCompatibility(
  user1: InferSelectModel<typeof user>,
  user2: InferSelectModel<typeof user>
): Promise<number> {
  if (
    user1.preference !== user2.gender ||
    user2.preference !== user1.gender
  ) {
    return -1;
  }

  const existingReport = await db.query.report.findFirst({
    where: or(
      and(
        eq(report.incomingUserId, user1.id),
        eq(report.outgoingUserId, user2.id)
      ),
      and(
        eq(report.incomingUserId, user2.id),
        eq(report.outgoingUserId, user1.id)
      )
    ),
  });

  if (existingReport) {
    return -1;
  }

  if (!user2.profile) {
    return 0
  }

  const user2EncodedProfile = encodeProfile(user2.profile as ProfileInput);

  if (user1.matchesWeights.weights.length == 0) return 0;

  const dotProduct = user1.matchesWeights.weights.reduce(
    (accum, curr, index) => accum + curr * user2EncodedProfile[index],
    0
  );

  return dotProduct;
}

export async function updateUserBiases(sourceUserId: any, targetUserId: any) {

  // Fetch target user profile
  const targetUser = await db.query.user.findFirst({
    where: eq(user.id, targetUserId),
  });

  // Prevents some errors with Ian's default user
  if (!targetUser?.profile) return;
  const targetEncoded = encodeProfile(targetUser.profile as ProfileInput);

  const sourceUser = await db.query.user.findFirst({
    where: eq(user.id, sourceUserId),
  });

  if (!sourceUser) return;

  const existing = (sourceUser as any).matchesWeights ?? { weights: [], strength: 0 };
  const existingWeights: number[] = Array.isArray(existing.weights)
    ? [...existing.weights]
    : [];
  const existingStrength: number = typeof existing.strength === "number" ? existing.strength : 0;

  // ensure weights length matches schema
  const total = SCHEMA_MAP.totalOptionCount;
  if (existingWeights.length < total) {
    existingWeights.length = total;
    for (let i = 0; i < total; i++) {
      if (existingWeights[i] === undefined) existingWeights[i] = 0;
    }
  } else if (existingWeights.length > total) {
    existingWeights.length = total;
  }

  const newStrength = existingStrength + 1;

  const newWeights = existingWeights.map((w, i) => {
    const targetVal = targetEncoded[i] ?? 0;
    return (w * existingStrength + targetVal) / newStrength;
  });

  await db.update(user).set({
    matchesWeights: { strength: newStrength, weights: newWeights } as any,
  }).where(eq(user.id, sourceUserId));
}