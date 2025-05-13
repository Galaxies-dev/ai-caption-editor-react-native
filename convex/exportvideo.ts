'use node';

import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action } from './_generated/server';
import { ConvexError, v } from 'convex/values';

const MICROSERVICE_URL = process.env.MICROSERVICE_URL as string;

// Generate a video with burned-in captions
export const generateCaptionedVideo = action({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    console.log('Starting video caption generation for project:', args.id);

    // Get project details
    const project = await ctx.runQuery(internal.projects.getProjectById, {
      id: args.id as Id<'projects'>,
    });

    if (!project) {
      throw new ConvexError('Project not found');
    }
    if (!project.captions || !project.captionSettings) {
      throw new ConvexError('Project must have captions and caption settings');
    }

    // Get video URL
    const videoUrl = await ctx.runQuery(internal.projects.getFileUrlById, {
      id: project.videoFileId,
    });

    if (!videoUrl) {
      throw new ConvexError('Video URL not found');
    }

    // Get audio URL if it exists
    let audioUrl: string | undefined;
    if (project.audioFileId) {
      const url = await ctx.runQuery(internal.projects.getFileUrlById, {
        id: project.audioFileId,
      });
      if (url) {
        audioUrl = url;
        console.log('Retrieved audio URL:', { hasUrl: true });
      } else {
        console.log('Audio file exists but URL could not be retrieved');
      }
    }

    try {
      // Make request to microservice
      const response = await fetch(MICROSERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputUrl: videoUrl,
          outputFormat: 'mp4',
          captions: project.captions,
          captionSettings: {
            fontSize: Math.floor(project.captionSettings.fontSize * 0.75), // Scale down font size to match preview
            position: project.captionSettings.position,
            color: project.captionSettings.color,
          },
          audioUrl, // Include audioUrl if it exists
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Microservice error: ${error.error}`);
      }

      // Get video data from response
      const videoBuffer = await response.arrayBuffer();

      // Upload to Convex storage with proper content type
      const storageId = await ctx.storage.store(new Blob([videoBuffer], { type: 'video/mp4' }));

      // Update project with new video ID
      await ctx.runMutation(internal.projects.updateProjectById, {
        id: args.id,
        generatedVideoFileId: storageId,
      });

      // Get the URL for the generated video
      const finalVideoUrl = await ctx.storage.getUrl(storageId);
      return finalVideoUrl;
    } catch (error) {
      console.error('Error in video generation:', error);
      throw error;
    }
  },
});
