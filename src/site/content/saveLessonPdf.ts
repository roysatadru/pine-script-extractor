import { HTTPResponse } from 'puppeteer';
import { downloadPdf } from '../../services/pdf/downloadPdf';
import path from 'node:path';

export const saveLessonPdf = (saveOptions: {
  outputFolder: string;
  outputFilePrefix: string;
}) => {
  const { outputFolder, outputFilePrefix } = saveOptions;
  const regexForPdf = new RegExp('pdf', 'g');

  let pdfCount = 0;

  async function savePdf(response: HTTPResponse) {
    const contentType = response.headers()['content-type'];

    if (!regexForPdf.test(contentType)) {
      return;
    }

    pdfCount++;

    const outputPath = path.join(
      outputFolder,
      `${outputFilePrefix} - ${pdfCount}`,
    );

    await downloadPdf(response.url(), outputPath);
  }

  return savePdf;
};
