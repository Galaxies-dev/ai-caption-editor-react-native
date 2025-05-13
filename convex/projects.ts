import { v } from 'convex/values';
import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import { ConvexError } from 'convex/values';
import { getUser, authorizeProject } from './auth';

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
    videoSize: v.number(),
    videoFileId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    return await ctx.db.insert('projects', {
      userId: user._id,
      name: args.name,
      lastUpdate: Date.now(),
      videoSize: args.videoSize,
      videoFileId: args.videoFileId,
      status: 'pending',
    });
  },
});

// Get a single project by ID
export const get = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const { project } = await authorizeProject(ctx, args.projectId);
    return project;
  },
});

// List all projects
export const list = query(async (ctx) => {
  const user = await getUser(ctx);

  const projects = await ctx.db
    .query('projects')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect();

  return projects;
});

// Update project details
export const update = mutation({
  args: {
    id: v.id('projects'),
    name: v.optional(v.string()),
    status: v.optional(v.union(v.literal('processing'), v.literal('ready'), v.literal('failed'))),
    error: v.optional(v.string()),
    language: v.optional(v.string()),
    captions: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
          type: v.union(v.literal('word'), v.literal('spacing')),
          speaker_id: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new ConvexError('Project not found');
    }

    // If captions are being updated, set status to ready
    if (updates.captions) {
      updates.status = 'ready';
    }

    await ctx.db.patch(id, {
      ...updates,
      lastUpdate: Date.now(),
    });
  },
});

// Update caption settings
export const updateCaptionSettings = mutation({
  args: {
    id: v.id('projects'),
    settings: v.object({
      fontSize: v.number(),
      position: v.union(v.literal('top'), v.literal('middle'), v.literal('bottom')),
      color: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    console.log('Updating caption settings for project:', args.id);
    console.log('New settings:', args.settings);

    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new ConvexError('Project not found');
    }

    await ctx.db.patch(args.id, {
      captionSettings: args.settings,
      lastUpdate: Date.now(),
    });

    console.log('Caption settings updated successfully');
    return args.settings;
  },
});

export const updateProjectById = internalMutation({
  args: {
    id: v.id('projects'),
    generatedVideoFileId: v.optional(v.id('_storage')),
    audioFileId: v.optional(v.id('_storage')),
    words: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
          type: v.union(v.literal('word'), v.literal('spacing')),
          speaker_id: v.string(),
        })
      )
    ),
    language_code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, language_code, words, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      lastUpdate: Date.now(),
      captions: words,
      language: language_code,
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
  args: { id: v.optional(v.id('_storage')) },
  handler: async (ctx, args) => {
    if (!args.id) {
      throw new ConvexError('File ID is required');
    }
    return await ctx.storage.getUrl(args.id);
  },
});

export const getFileUrlById = internalQuery({
  args: { id: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.id);
  },
});

export const getProjectById = internalQuery({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update project script
export const updateScript = mutation({
  args: {
    id: v.id('projects'),
    script: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new ConvexError('Project not found');
    }

    await ctx.db.patch(args.id, {
      script: args.script,
      lastUpdate: Date.now(),
    });

    return args.script;
  },
});
