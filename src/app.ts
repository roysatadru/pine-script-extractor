import path from 'node:path';
import { launchBrowser } from './services/puppeteer';
import * as utils from './utils';
import fs from 'node:fs';
import commandLineArgs from 'command-line-args';
import * as helpers from './helpers';
import {
  saveLessonContent,
  saveLessonPdf,
  saveLessonSourceCode,
  saveLessonVideo,
} from './site/content';
import { Browser, Page } from 'puppeteer';
import { gotoPage } from './services/puppeteer/goToPage';

// accept the command line arguments
const optionDefinitions = [
  { name: 'output-path', alias: 'o', type: String },
  { name: 'email', alias: 'e', type: String },
  { name: 'password', alias: 'p', type: String },
  { name: 'url', alias: 'u', type: String },
];
const options = commandLineArgs(optionDefinitions);

const credentials = {
  email: process.env.EMAIL ?? options.email ?? '',
  password: process.env.PASSWORD ?? options.password ?? '',
  url: process.env.URL ?? options.url ?? '',
};

const outputAbsolutePath: string =
  process.env.OUTPUT_PATH ?? options['output-path'] ?? '';

async function retryLoginUntilSuccess(): Promise<{
  browser: Browser;
  page: Page;
}> {
  const { browser } = await launchBrowser({
    defaultViewport: { width: 1920, height: 1024 },
  });

  try {
    await browser.newPage();
    const page = await gotoPage(browser, credentials.url);
    const mainPage = await helpers.randomizeUserInteraction(page);

    // select <input> elements with id="user[email]" and "user[password]" and checkbox "user[remember_me]" and fill them with the provided credentials
    await mainPage.type('input[id="user[email]"]', credentials.email); // fill the input with the provided email
    await mainPage.type('input[id="user[password]"]', credentials.password); // fill the input with the provided password
    await mainPage.click('input[id="user[remember_me]"]'); // click the checkbox

    await mainPage.click('input[type="submit"]'); // click the submit button

    helpers.logger.verbose('Logging in...');

    // wait for the page redirect
    await mainPage.waitForNavigation({
      waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
      timeout: 20000,
    });

    helpers.logger.verbose('Logged in!');

    return { browser, page: mainPage };
  } catch (error) {
    await browser.close();

    await utils.delay(5000);

    helpers.logger.error('Could not log in. Retrying...');
    return retryLoginUntilSuccess();
  }
}

export async function app() {
  const outputPath = path.join(outputAbsolutePath);

  const puppeteerDetails = await retryLoginUntilSuccess();

  const browser = puppeteerDetails.browser;
  let page = puppeteerDetails.page;

  await page.click('a[href^="/courses/take/pine-script-mastery/"]'); // click the link to the course

  helpers.logger.verbose('Navigating to the course...');

  // wait for the page redirect
  await page.waitForNavigation({
    waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
  });

  helpers.logger.verbose('Course loaded!');

  await utils.delay(5000);

  // select the element with the class "course-player__chapters-menu" and
  const headingsHTMLList = await page.$eval(
    '.course-player__chapters-menu',
    (rootListElement) => {
      const clonedNode = rootListElement.cloneNode(true) as HTMLElement;

      const listItems = [...clonedNode.children];

      const listValues = listItems.map((listItem, sectionIndex) => {
        const heading = listItem.querySelector(
          '.course-player__chapter-item__header h2',
        );
        const subList = listItem.querySelector(
          'ul.course-player__chapter-item__contents',
        );
        const subListItems = subList!.querySelectorAll(
          'li.course-player__content-item a',
        ) as NodeListOf<HTMLAnchorElement>;

        const subListHeadingsHTML = [...subListItems].map(
          (subListItem, headingIndex) => {
            const lessonLink = subListItem.href;

            const clonedSubListItem = subListItem
              .querySelector('div.content-item__title')!
              .cloneNode(true) as HTMLElement;

            clonedSubListItem.children.item(0)!.remove();

            return {
              section: heading!.outerHTML,
              sectionIndex: sectionIndex + 1,
              heading: clonedSubListItem.outerHTML,
              lessonLink,
              headingIndex: headingIndex + 1,
            };
          },
        );

        return subListHeadingsHTML;
      });

      return listValues.flat();
    },
  );

  const headingMap = [] as Array<{
    rawSection: string;
    section: string;
    headings: Array<{
      rawHeading: string;
      heading: string;
      link: string;
    }>;
  }>;

  // convert the HTML to markdown
  headingsHTMLList.forEach((heading) => {
    const object = {
      sectionIndex: heading.sectionIndex,
      section: helpers.extractHeadingTextFromHTML(heading.section),
      headingIndex: heading.headingIndex,
      heading: helpers.extractHeadingTextFromHTML(heading.heading),
    };

    if (
      headingMap.length <= 0 ||
      utils.convertToTextWithoutEmojis(
        headingMap[headingMap.length - 1].rawSection,
      ) !== utils.convertToTextWithoutEmojis(object.section)
    ) {
      headingMap.push({
        rawSection: object.section,
        section: `${heading.sectionIndex}. ${object.section}`,
        headings: [],
      });
    }

    headingMap[headingMap.length - 1].headings.push({
      rawHeading: object.heading,
      heading: `${heading.headingIndex}. ${object.heading}`,
      link: heading.lessonLink,
    });

    return object;
  });

  await page.close();

  // create the output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  for (let index = 0; index < headingMap.length; index++) {
    const section = headingMap[index];

    for (
      let headingIndex = 0;
      headingIndex < section.headings.length;
      headingIndex++
    ) {
      const asyncCalls = [] as Array<Promise<void>>;
      const heading = section.headings[headingIndex];

      page = await gotoPage(browser, heading.link);

      const outputFolder = path.join(outputPath, section.section);
      const outputFilePrefix = heading.heading;

      const [saveVideo, savePdf] = [
        saveLessonVideo({
          outputFolder,
          outputFilePrefix,
        }),
        saveLessonPdf({
          outputFolder,
          outputFilePrefix,
        }),
      ];

      page.on('response', async (response) => {
        asyncCalls.push(saveVideo(response));
        asyncCalls.push(savePdf(response));
      });

      await page.reload({
        waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
      });
      await utils.delay(5000);
      page.removeAllListeners('response');

      await Promise.all([
        saveLessonContent(page, {
          outputFolder,
          outputFilePrefix,
        }),
        saveLessonSourceCode(page, {
          outputFolder,
          outputFilePrefix,
        }),
        ...asyncCalls,
      ]);

      await page.close();

      helpers.logger.verbose(
        `📚 Finished downloading all resources for ${section.section} - ${heading.heading}!`,
      );
    }
  }

  await browser.close();
}
