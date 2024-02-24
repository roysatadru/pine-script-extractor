import * as helpers from '../../helpers';
import { CONSTANTS } from '../../constants';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import * as utils from '../../utils';

interface DownloadSubtitleOptions {
  hideCliProgress?: boolean;
  [key: string]: unknown;
}

export const downloadSubtitle = async (
  url: string,
  outputPath: string,
  language?: string,
  options?: DownloadSubtitleOptions,
) => {
  try {
    const subtitleExtensionURLRegex = /(?:\.([^.]+))?$/;
    const regexToRemoveQueryParams = /(\?|#).*$/;

    let urlExtension = url.match(subtitleExtensionURLRegex)?.[1];
    urlExtension = urlExtension?.replace(regexToRemoveQueryParams, '');

    let fileName = path.basename(outputPath);
    fileName = `${fileName}${language && ` - ${language}`}.${urlExtension ?? CONSTANTS.SUBTITLE_URL_EXTENSIONS[0]}`;

    outputPath = path.dirname(outputPath);

    const targetFileName = path.join(outputPath, fileName);

    helpers.logger.verbose(`#️⃣ Saving subtitle to ${targetFileName}...`);

    // if output path directory does not exist, create it recursively
    if (!fs.existsSync(outputPath)) {
      await fs.promises.mkdir(outputPath, { recursive: true });
    }

    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(targetFileName);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    helpers.logger.verbose(
      `#️⃣ Subtitle saved to ${targetFileName} successfully!`,
    );
  } catch (error) {
    const stringifiedError = utils.stringifyErrorObject(error, {
      functionName: 'downloadSubtitle',
      fileName: 'downloadSubtitle.ts',
      filePath: 'src/services/subtitle/downloadSubtitle.ts',
      arguments: [url, outputPath, language, options],
      extraData: {
        url,
        outputPath,
        language,
      },
    });

    helpers.logger.error(stringifiedError);
  }
};
