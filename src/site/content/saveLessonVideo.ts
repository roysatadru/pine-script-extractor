import { HTTPResponse } from 'puppeteer';
import * as m3u8Parser from 'm3u8-parser';
import * as utils from '../../utils';
import _ from 'lodash';
import { downloadHLS } from '../../services/video';
import path from 'node:path';
import { saveLessonVideoSubtitles } from './saveLessonVideoSubtitles';

export const saveLessonVideo = (saveOptions: {
  outputFolder: string;
  outputFilePrefix: string;
}) => {
  const { outputFolder, outputFilePrefix } = saveOptions;
  const regexForM3U8 = new RegExp('m3u8', 'g');

  let playlist: m3u8Parser.Playlist | undefined;

  const sharedData = {
    _playlist: playlist,
    get playlist() {
      return this._playlist;
    },
    set playlist(value: m3u8Parser.Playlist | undefined) {
      this._playlist = value;
    },
  };

  async function saveVideo(response: HTTPResponse) {
    if (!regexForM3U8.test(response.url())) {
      return;
    }

    if (sharedData.playlist) {
      return;
    }

    const responseBuffer = await response.buffer();
    const responseText = responseBuffer.toString('utf8');

    if (sharedData.playlist) {
      return;
    }

    const parser = new m3u8Parser.Parser();
    parser.push(responseText);
    parser.end();

    const playlists = parser?.manifest?.playlists;
    const mediaGroups = parser?.manifest?.mediaGroups;

    if (Array.isArray(playlists) && playlists.length > 0) {
      const resolutions = playlists.map((playlist) => {
        const resolution = playlist.attributes.RESOLUTION;
        return resolution;
      });

      const sortedResolutions = utils.sortResolutions(resolutions);

      const targetResolution = sortedResolutions[0];

      sharedData.playlist = playlists.find((playlist) => {
        const resolution = playlist.attributes.RESOLUTION;

        if (typeof resolution === 'string') {
          return resolution === targetResolution.resolutionString;
        }

        if (resolution && typeof resolution === 'object') {
          return (
            resolution?.width === targetResolution?.resolution?.width &&
            resolution?.height === targetResolution?.resolution?.height
          );
        }

        return false;
      });
    }

    if (!sharedData.playlist) {
      return;
    }

    const asyncCalls = [] as Array<Promise<void>>;

    if (
      mediaGroups &&
      typeof mediaGroups === 'object' &&
      !_.isEmpty(mediaGroups)
    ) {
      asyncCalls.push(
        ...Object.keys(mediaGroups).map(async (key) => {
          const mediaGroupsKey = key as keyof m3u8Parser.MediaGroups;

          switch (mediaGroupsKey) {
            case 'SUBTITLES': {
              const videoMediaGroups = mediaGroups?.[mediaGroupsKey];

              if (!videoMediaGroups) {
                return;
              }

              await saveLessonVideoSubtitles(videoMediaGroups, {
                outputFolder,
                outputFilePrefix,
              });

              break;
            }

            default: {
              return;
            }
          }
        }),
      );
    }

    const videoUri = sharedData.playlist.uri;

    asyncCalls.push(
      downloadHLS(videoUri, path.join(outputFolder, outputFilePrefix)),
    );

    await Promise.all(asyncCalls);
  }

  return saveVideo;
};
