import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Schema for a caption word/segment
const captionSegmentValidator = v.object({
  text: v.string(),
  start: v.number(),
  end: v.number(),
  type: v.union(v.literal('word'), v.literal('spacing')),
  speaker_id: v.string(),
});

export const User = {
  email: v.string(),
  // this the Clerk ID, stored in the subject JWT field
  externalId: v.string(),
  imageUrl: v.optional(v.string()),
  name: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable(User).index('byExternalId', ['externalId']),
  projects: defineTable({
    name: v.string(),
    lastUpdate: v.number(), // Unix timestamp
    videoSize: v.number(), // in bytes
    videoFileId: v.id('_storage'), // Reference to stored video file
    language: v.optional(v.string()),
    captions: v.optional(v.array(captionSegmentValidator)),
    status: v.union(v.literal('processing'), v.literal('ready'), v.literal('failed')),
    error: v.optional(v.string()),
  }).index('by_lastUpdate', ['lastUpdate']),
});
