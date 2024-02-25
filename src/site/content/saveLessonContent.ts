import fs from 'node:fs';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { Page } from 'puppeteer';
import path from 'node:path';
import * as helpers from '../../helpers';

export const saveLessonContent = async (
  page: Page,
  saveOptions: {
    outputFolder: string;
    outputFilePrefix: string;
  },
) => {
  const { outputFolder, outputFilePrefix } = saveOptions;

  // create the output directory if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const outputPath = path.join(outputFolder, `${outputFilePrefix}.md`);

  helpers.logger.verbose(`📃 Saving lesson content for ${outputPath}...`);

  const nhm = new NodeHtmlMarkdown();

  try {
    const lessonContentHTML = await page.$eval(
      '[id^="ember"] .custom-theme .fr-view > *:not(.fr-view)',
      (element) => {
        const clonedElement = element.parentElement!.cloneNode(
          true,
        ) as HTMLElement;

        [...clonedElement.children].forEach((child) => {
          let shouldInclude = !/^( )*source( )*code/gi.test(child.textContent!);

          if (!shouldInclude) {
            child.remove();
            return;
          }

          shouldInclude = !Array.from(child.classList).some((className) =>
            /^( )*kapow-copy/gi.test(className),
          );

          if (!shouldInclude) {
            child.remove();
          }
        });

        return clonedElement.outerHTML;
      },
    );

    const lessonContentMarkdown = nhm.translate(lessonContentHTML);

    await fs.promises.writeFile(
      path.join(outputFolder, `${outputFilePrefix}.md`),
      lessonContentMarkdown,
    );

    helpers.logger.verbose(
      `📃 Lesson content saved to ${outputPath} successfully!`,
    );
  } catch (error) {
    helpers.logger.error(
      `Could not save lesson content to ${outputPath}. Error: ${error}`,
    );
  }
};
