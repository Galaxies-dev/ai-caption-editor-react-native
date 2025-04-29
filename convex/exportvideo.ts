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
    console.log('Retrieved project:', {
      hasProject: !!project,
      hasCaptions: project?.captions?.length,
      hasCaptionSettings: !!project?.captionSettings,
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
    console.log('Retrieved video URL:', { hasUrl: !!videoUrl });

    if (!videoUrl) {
      throw new ConvexError('Video URL not found');
    }

    try {
      // Make request to microservice
      console.log('Making request to microservice...: ', MICROSERVICE_URL);
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
        }),
      });

      // console.log('Response:', response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Microservice error: ${error.error}`);
      }

      // Get video data from response
      const videoBuffer = await response.arrayBuffer();
      console.log('🚀 ~ handler: ~ videoBuffer:', videoBuffer);
      console.log('Received processed video from microservice');

      // Upload to Convex storage with proper content type
      console.log('Uploading generated video to storage...');
      const storageId = await ctx.storage.store(new Blob([videoBuffer], { type: 'video/mp4' }));
      console.log('Video uploaded with storage ID:', storageId);

      // Update project with new video ID
      console.log('Updating project with generated video ID...');
      await ctx.runMutation(internal.projects.updateProjectById, {
        id: args.id,
        generatedVideoFileId: storageId,
      });

      // Get the URL for the generated video
      const finalVideoUrl = await ctx.storage.getUrl(storageId);
      console.log('Generated video URL:', finalVideoUrl);
      return finalVideoUrl;
    } catch (error) {
      console.error('Error in video generation:', error);
      throw error;
    }
  },
});
