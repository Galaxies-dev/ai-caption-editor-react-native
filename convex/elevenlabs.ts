'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { ElevenLabsClient } from 'elevenlabs';
import * as fs from 'fs';
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

      // const buffer = Buffer.from(await response.arrayBuffer());
      // await fs.promises.writeFile(tempFilePath, buffer);

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

// const project = await ctx.db.get(args.id);
// if (!project) {
//   throw new ConvexError('Project not found');
// }

// // Get the video file from storage
// const videoFile = await ctx.storage.getUrl(project.videoFileId);
// if (!videoFile) {
//   throw new ConvexError('Video file not found');
// }

// try {
//   // Call ElevenLabs Speech to Text API
//   const result = await client.speechToText.convert({
//     file: fs.createReadStream(videoFile),
//     model_id: 'scribe_v1',
//   });
