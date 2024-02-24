import { Browser, Page } from 'puppeteer';
import { logger } from '../../helpers';

export const closeTabs = async (browser: Browser, except = [] as Page[]) => {
  logger.verbose('Processing to close tabs...');

  const pages = await browser.pages();

  if (!Array.isArray(except)) {
    except = [except];
  }

  except = except.reduce((acc: Page[], page: Page | Page[]) => {
    function recursivePush(page: Page | Page[]): Page[] {
      if (Array.isArray(page)) {
        return page.reduce((acc, p) => recursivePush(p), acc);
      }

      if (!page || page.isClosed()) {
        return acc;
      }

      return acc.concat([page]);
    }

    return recursivePush(page);
  }, []);

  if (!except.length || !pages.length) {
    logger.verbose('Closing all tabs... the browser will be closed!');
    await browser.close();
    return;
  }

  const pagesToClose = pages.filter((page) => !except.includes(page));
  const pagesNotToClose = pages.filter((page) => except.includes(page));
  const pagesNotToCloseUrls = pagesNotToClose.map((page) => page.url());

  logger.verbose(`Closing tabs... except: ${except.length} tabs`);
  logger.verbose(
    `Tabs with url that shouldn't be closed: ${pagesNotToCloseUrls.join(', ')}`,
  );

  await Promise.all(pagesToClose.map((page) => page.close()));
};
