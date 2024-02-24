import { Browser, HTTPResponse, Handler, Page } from 'puppeteer';
import * as utils from '../../utils';
import { gotoPage } from './gotoPage';

export const attachPageResponseListener = async (
  browser: Browser,
  link: string,
  handler: Handler<HTTPResponse>,
): Promise<Page> => {
  const page = await gotoPage(browser, link);

  try {
    page.on('response', handler);

    await page.reload({
      waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
    });

    await utils.delay(30000);

    page.removeAllListeners('response');

    return page;
  } catch (error) {
    await page.close();

    return attachPageResponseListener(browser, link, handler);
  }
};
