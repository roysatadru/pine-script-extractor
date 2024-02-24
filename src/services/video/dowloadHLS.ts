import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import * as m3u8Parser from 'm3u8-parser';
import { nanoid } from 'nanoid';
import * as utils from '../../utils';
import * as helpers from '../../helpers';

type PlaylistParams = keyof Omit<m3u8Parser.Playlist, 'uri'>;

type DownloadHLSOptions = {
  [P in PlaylistParams]?: m3u8Parser.Playlist[P];
} & {
  hideCliProgress?: boolean;
  retrySegmentDownloadCount?: number;
  [key: string]: unknown;
};

export const downloadHLS = async (
  playlistUrl: string,
  outputPath: string,
  options?: DownloadHLSOptions,
) => {
  try {
    const { retrySegmentDownloadCount = 10 } =
      options ?? ({} as DownloadHLSOptions);

    outputPath = `${outputPath}.mp4`;

    helpers.logger.verbose(`📹 Saving HLS playlist video to ${outputPath}...`);

    // Step 1: Download the playlist
    const playlistResponse = await axios.get(playlistUrl);

    const parser = new m3u8Parser.Parser();
    parser.push(playlistResponse.data);
    parser.end();

    const parsedPlaylist = parser.manifest;
    if (!parsedPlaylist?.segments || parsedPlaylist.segments?.length === 0) {
      throw new Error('Playlist contains no segments');
    }

    const uniqueDirectoryName = `.temp-${nanoid(36)}`;
    const segmentsDir = path.resolve(
      path.dirname(outputPath),
      uniqueDirectoryName,
    );
    const concatedSegmentsPath = path.join(segmentsDir, 'concat-segments.ts');

    // Ensure the segments directory exists and is hidden
    await fsPromise.mkdir(segmentsDir, { recursive: true });

    let segmentFiles = [] as string[];

    // Step 2: Download each segment asynchronously and save it to the segments directory
    const asyncDownloadSegments = parsedPlaylist.segments.map(
      async (segment: { uri: string }, index: number) => {
        const segmentUrl = new URL(segment.uri, playlistUrl).toString(); // Resolve the full segment URL
        const segmentPath = path.join(segmentsDir, `segment-${index}.ts`);
        // keep on retrying to download the segment until it's downloaded successfully
        let maxRetries = retrySegmentDownloadCount;

        async function downloadSegment() {
          try {
            const response = await axios({
              url: segmentUrl,
              method: 'GET',
              responseType: 'stream',
            });

            const writer = fs.createWriteStream(segmentPath);
            response.data.pipe(writer);

            await new Promise<void>((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            segmentFiles[index] = segmentPath;
          } catch (error) {
            await utils.delay(1000);
            if (maxRetries > 0) {
              maxRetries--;
              return downloadSegment();
            } else {
              throw error;
            }
          }
        }

        await downloadSegment();
      },
    );

    await Promise.all(asyncDownloadSegments);

    // Step 3: Process downloaded segments with ffmpeg
    segmentFiles = segmentFiles.filter(Boolean);
    if (segmentFiles.length === 0) {
      throw new Error('No segments were downloaded');
    }

    // Combine the segments into a single file
    await helpers.combineFiles(segmentFiles, concatedSegmentsPath);

    await new Promise<void>((resolve, reject) => {
      // Use fluent-ffmpeg to concatenate the segments
      ffmpeg()
        .input(concatedSegmentsPath)
        .outputOptions([
          '-c copy', // Copy codecs
          '-bsf:a aac_adtstoasc', // Necessary bitstream filter for AAC audio
        ]) // Copy codecs
        .output(outputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });

    // Step 4: Cleanup the segments directory
    await fsPromise.rm(segmentsDir, { recursive: true });

    helpers.logger.verbose(
      `📹 HLS playlist video saved to ${outputPath} successfully!`,
    );
  } catch (error) {
    const stringifiedError = utils.stringifyErrorObject(error, {
      functionName: 'downloadHLS',
      fileName: 'downloadHLS.ts',
      filePath: 'src/services/video/downloadHLS.ts',
      arguments: [playlistUrl, outputPath, options],
      extraData: {
        playlistUrl,
        outputPath,
      },
    });

    helpers.logger.error(stringifiedError);
  }
};
