import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Schema for a caption word/segment
const captionSegmentValidator = v.object({
  text: v.string(),
  start: v.number(),
  end: v.number(),
  type: v.union(v.literal('word'), v.literal('spacing'), v.literal('audio_event')),
  speaker_id: v.string(),
  characters: v.optional(
    v.array(
      v.object({
        text: v.string(),
        start: v.number(),
        end: v.number(),
      })
    )
  ),
});

// Schema for caption styling settings
const captionSettingsValidator = v.object({
  fontSize: v.number(),
  position: v.union(v.literal('top'), v.literal('middle'), v.literal('bottom')),
  color: v.string(),
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
    captionSettings: v.optional(captionSettingsValidator),
    generatedVideoFileId: v.optional(v.id('_storage')), // Reference to video with burned-in captions
    audioFileId: v.optional(v.id('_storage')), // Reference to generated audio file
    script: v.optional(v.string()), // Script for text-to-speech
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('ready'),
      v.literal('failed')
    ),
    error: v.optional(v.string()),
  }).index('by_lastUpdate', ['lastUpdate']),
});
