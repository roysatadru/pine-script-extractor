import fs from 'node:fs';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { Page } from 'puppeteer';
import path from 'node:path';
import * as helpers from '../../helpers';

export const saveLessonSourceCode = async (
  page: Page,
  saveOptions: {
    outputFolder: string;
    outputFilePrefix: string;
  },
) => {
  const { outputFolder, outputFilePrefix } = saveOptions;

  const outputPath = path.join(outputFolder, `${outputFilePrefix}.pine`);

  helpers.logger.verbose(`🧑‍💻 Saving lesson source code for ${outputPath}...`);

  const nhm = new NodeHtmlMarkdown();

  try {
    const sourceCodeHTML = await page.$eval(
      '[id^="ember"] .custom-theme .kapow-copy pre',
      (element) => {
        const clonedElement = element.parentElement!.cloneNode(
          true,
        ) as HTMLElement;
        return clonedElement.outerHTML;
      },
    );

    const sourceCodeWithoutLineIndents = sourceCodeHTML.replace(
      /\n {2}/g,
      '\n',
    );

    const sourceCodeMarkdown = nhm.translate(sourceCodeWithoutLineIndents);

    await fs.promises.writeFile(outputPath, sourceCodeMarkdown);

    helpers.logger.verbose(
      `🧑‍💻 Lesson source code saved to ${outputPath} successfully!`,
    );
  } catch (error) {
    helpers.logger.error(
      `Could not save lesson source code to ${outputPath}. Error: ${error}`,
    );
  }
};
