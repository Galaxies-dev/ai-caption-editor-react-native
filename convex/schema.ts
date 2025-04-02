import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const User = {
  email: v.string(),
  // this the Clerk ID, stored in the subject JWT field
  externalId: v.string(),
  imageUrl: v.optional(v.string()),
  name: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable(User).index('byExternalId', ['externalId']),
});
