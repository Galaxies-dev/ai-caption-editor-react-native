import { Router, Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const router = Router();

interface Caption {
  text: string;
  start: number;
  end: number;
  type: 'word' | 'spacing';
  speaker_id: string;
}

interface CaptionSettings {
  fontSize: number;
  position: 'top' | 'middle' | 'bottom';
  color: string;
  backgroundColor?: string; // Optional background color in hex format (#RRGGBB)
  padding?: number; // Optional padding in pixels
  borderRadius?: number; // Optional border radius in pixels
}

interface TranscodeRequest {
  inputUrl: string;
  outputFormat: string;
  captions?: Caption[];
  captionSettings?: CaptionSettings;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Save request body to a file for debugging
async function saveRequestToFile(requestBody: TranscodeRequest): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `request-${timestamp}.json`);
  await fs.promises.writeFile(logPath, JSON.stringify(requestBody, null, 2));
  console.log(`Request saved to ${logPath}`);
}

// Convert time in seconds to FFmpeg time format (HH:MM:SS.mmm)
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Generate subtitle file content in SRT format
function generateSrtContent(captions: Caption[]): string {
  return captions
    .map((caption, index) => {
      return `${index + 1}
${formatTime(caption.start)} --> ${formatTime(caption.end)}
${caption.text}

`;
    })
    .join('');
}

// Get vertical position based on setting
function getVerticalPosition(position: 'top' | 'middle' | 'bottom'): string {
  switch (position) {
    case 'top':
      return '10';
    case 'middle':
      return '25';
    case 'bottom':
      return '50';
  }
}

// Convert hex color to FFmpeg format (BBGGRR)
function convertHexToFFmpegColor(hexColor: string): string {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  // Split into RGB components
  const r = hex.substring(0, 2);
  const g = hex.substring(2, 4);
  const b = hex.substring(4, 6);
  // Return in BBGGRR format with 0x prefix
  return `0x${b}${g}${r}`;
}

router.post('/', async (req: Request<{}, {}, TranscodeRequest>, res: Response) => {
  try {
    const { inputUrl, outputFormat, captions, captionSettings } = req.body;

    // Save request body to file
    await saveRequestToFile(req.body);

    if (!inputUrl || !outputFormat) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create temporary directory for processing
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'transcode-'));
    const outputPath = path.join(tempDir, `output.${outputFormat}`);
    let command = ffmpeg(inputUrl);

    // If captions are provided, create and apply them
    if (captions && captionSettings) {
      const srtPath = path.join(tempDir, 'captions.srt');
      await fs.promises.writeFile(srtPath, generateSrtContent(captions));

      const fontColor = convertHexToFFmpegColor(captionSettings.color);
      console.log('🚀 ~ router.post ~ fontColor:', fontColor);
      const position = getVerticalPosition(captionSettings.position);
      console.log('🚀 ~ router.post ~ position:', position);
      console.log('🚀 ~ router.post ~ captionSettings:', captionSettings);
      // Add subtitle filter with styling

      const alignment =
        captionSettings.position === 'top' ? 6 : captionSettings.position === 'middle' ? 10 : 2;

      command = command.videoFilters([
        {
          filter: 'subtitles',
          options: {
            filename: srtPath,
            force_style: `Alignment=${alignment},Shadow=0,FontSize=${captionSettings.fontSize},PrimaryColour=${fontColor},BorderStyle=0,MarginV=${position},Outline=4`,
          },
        },
      ]);
    }

    // Set up FFmpeg command
    command
      .outputFormat(outputFormat)
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing:', progress.percent, '% done');
      })
      .on('end', () => {
        // Read the processed file and send it back
        res.sendFile(outputPath, async (err) => {
          if (err) {
            console.error('Error sending file:', err);
          }
          // Clean up temporary files
          try {
            await fs.promises.rm(tempDir, { recursive: true });
          } catch (cleanupError) {
            console.error('Error cleaning up:', cleanupError);
          }
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Transcoding failed', details: err.message });
        // Clean up on error
        fs.promises.rm(tempDir, { recursive: true }).catch(console.error);
      });

    // Start the transcoding process
    command.save(outputPath);
  } catch (error) {
    console.error('Transcoding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const transcodeRouter = router;
