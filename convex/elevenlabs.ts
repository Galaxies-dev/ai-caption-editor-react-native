'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { ElevenLabsClient } from 'elevenlabs';
import { internal } from './_generated/api';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// Action to process video with ElevenLabs API
export const processVideo = action({
  args: {
    videoId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    try {
      // Get the file from Convex storage
      const file = await ctx.storage.getUrl(args.videoId);
      if (!file) {
        throw new Error('File not found in storage');
      }
      console.log('file', file);

      // Create a temporary file path
      const tempFilePath = `/tmp/${args.videoId}.mp4`;
      const response = await fetch(file);
      const videoBlob = new Blob([await response.arrayBuffer()], { type: 'video/mp4' });

      // Call ElevenLabs Speech to Text API
      console.log('Processing video with ElevenLabs');
      const result = await client.speechToText.convert({
        // file: fs.createReadStream(tempFilePath),
        file: videoBlob,
        model_id: 'scribe_v1',
        language_code: 'eng',
      });
      console.log('Speech to text conversion completed');

      // Clean up temporary file
      // await fs.promises.unlink(tempFilePath);
      // console.log('Temporary file cleaned up');

      // Transform and filter words to match our schema
      const transformedWords = result.words
        .filter((word) => word.type !== 'audio_event')
        .map((word) => ({
          text: word.text,
          start: word.start ?? 0,
          end: word.end ?? (word.start ?? 0) + 0.1,
          type: word.type as 'word' | 'spacing',
          speaker_id: word.speaker_id ?? 'speaker_1',
        }));

      return {
        words: transformedWords,
        language_code: result.language_code,
      };
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  },
});

// Action to generate speech from script
export const generateSpeech = action({
  args: {
    projectId: v.id('projects'),
    voiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get the project
      const project = await ctx.runQuery(internal.projects.getProjectById, {
        id: args.projectId,
      });

      if (!project || !project.script) {
        throw new Error('Project not found or no script available');
      }

      // Use default voice if none specified
      const voiceId = args.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default voice ID

      // Generate speech from script
      const audioResponse = await client.textToSpeech.convert(voiceId, {
        text: project.script,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      });

      // Convert audio response to blob
      const audioBuffer = Buffer.from(await audioResponse);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

      // Store audio file in Convex storage
      const audioFileId = await ctx.storage.store(audioBlob);

      // Update project with audio file ID
      await ctx.runMutation(internal.projects.updateProjectById, {
        id: args.projectId,
        audioFileId,
      });

      // Return the URL to the audio file
      return await ctx.storage.getUrl(audioFileId);
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  },
});
