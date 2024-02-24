import axios from 'axios';
import path from 'node:path';
import fs from 'node:fs';
import * as utils from '../../utils';
import * as helpers from '../../helpers';

export const downloadPdf = async (url: string, outputPath: string) => {
  const fileName = path.basename(outputPath) + '.pdf';
  const directoryName = path.dirname(outputPath);
  outputPath = path.join(directoryName, fileName);

  helpers.logger.verbose(`📄 Saving PDF to ${outputPath}...`);

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    // if output path directory does not exist, create it recursively
    if (!fs.existsSync(directoryName)) {
      await fs.promises.mkdir(directoryName, { recursive: true });
    }

    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    helpers.logger.verbose(`📄 PDF saved to ${outputPath} successfully!`);
  } catch (error) {
    const stringifiedError = utils.stringifyErrorObject(error, {
      functionName: 'downloadPdf',
      fileName: 'downloadPdf.ts',
      filePath: 'src/services/pdf/downloadPdf.ts',
      arguments: [url, outputPath],
      extraData: {
        url,
        outputPath,
      },
    });

    helpers.logger.error(stringifiedError);
  }
};
