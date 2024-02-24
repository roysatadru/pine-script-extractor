import axios from 'axios';
import { getActualMediaObjects } from '../../services/m3u8Parser';
import * as m3u8Parser from 'm3u8-parser';
import { downloadSubtitle } from '../../services/subtitle';
import path from 'node:path';
import * as utils from '../../utils';
import * as helpers from '../../helpers';

export const saveLessonVideoSubtitles = async (
  mediaGroups: m3u8Parser.MediaGroups['SUBTITLES'],
  saveOptions: {
    outputFolder: string;
    outputFilePrefix: string;
  },
) => {
  const { outputFolder, outputFilePrefix } = saveOptions;
  const resourceType = 'm3u8';

  const subtitles = (await getActualMediaObjects(
    mediaGroups ?? {},
  )) as m3u8Parser.Subtitle[];

  if (!subtitles || subtitles.length <= 0) {
    return;
  }

  await Promise.all(
    subtitles.map(async (subtitle) => {
      if (new RegExp(resourceType, 'g').test(subtitle.uri)) {
        try {
          const { data } = await axios.get(subtitle.uri, {
            responseType: 'arraybuffer',
          });

          const parser = new m3u8Parser.Parser();
          parser.push(data);
          parser.end();

          const language =
            'key' in subtitle
              ? `${subtitle.language} (${subtitle['key']})`
              : subtitle.language;

          if (parser?.manifest?.segments?.length) {
            await Promise.all(
              parser.manifest.segments.map(async (segment) => {
                await downloadSubtitle(
                  segment.uri,
                  path.join(outputFolder, outputFilePrefix),
                  language,
                );
              }),
            );
          }
        } catch (error) {
          const stringifiedError = utils.stringifyErrorObject(error, {
            functionName: 'saveLessonContent',
            fileName: 'saveLessonContent.ts',
            filePath: 'src/site/content/saveLessonContent.ts',
            arguments: [mediaGroups, saveOptions],
            extraData: {
              subtitle,
            },
          });

          helpers.logger.error(stringifiedError);
        }
      }
    }),
  );
};
