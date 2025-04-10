import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import { ConvexError } from 'convex/values';

// Generate a URL to upload a video file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create a new project with the uploaded file
export const create = mutation({
  args: {
    name: v.string(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    // Get the file size from storage
    // `db.system.get(Id<"_storage">)` instead.
    const file = await ctx.db.system.get(args.storageId);
    if (!file) {
      throw new ConvexError('File not found in storage');
    }

    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      lastUpdate: Date.now(),
      videoSize: file.size,
      videoFileId: args.storageId,
      status: 'processing',
    });
    return projectId;
  },
});

// Get a single project by ID
export const get = query({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new ConvexError('Project not found');
    }
    return project;
  },
});

// List all projects
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('projects').withIndex('by_lastUpdate').order('desc').collect();
  },
});

// Update project details
export const update = mutation({
  args: {
    id: v.id('projects'),
    name: v.optional(v.string()),
    status: v.optional(v.union(v.literal('processing'), v.literal('ready'), v.literal('failed'))),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new ConvexError('Project not found');
    }

    await ctx.db.patch(id, {
      ...updates,
      lastUpdate: Date.now(),
    });
  },
});

// Update project captions
export const updateCaptions = mutation({
  args: {
    id: v.id('projects'),
    language: v.string(),
    captions: v.array(
      v.object({
        text: v.string(),
        start: v.number(),
        end: v.number(),
        type: v.union(v.literal('word'), v.literal('spacing')),
        speaker_id: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new ConvexError('Project not found');
    }

    await ctx.db.patch(args.id, {
      language: args.language,
      captions: args.captions,
      status: 'ready',
      lastUpdate: Date.now(),
    });
  },
});

// Delete a project
export const remove = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new ConvexError('Project not found');
    }

    // Delete the video file from storage
    await ctx.storage.delete(existing.videoFileId);
    // Delete the project record
    await ctx.db.delete(args.id);
  },
});

// Get a file URL from storage
export const getFileUrl = query({
  args: { id: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.id);
  },
});
