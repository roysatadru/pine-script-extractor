import { Browser, Page } from 'puppeteer';
import UserAgent from 'user-agents';
import * as utils from '../../utils';

const userAgent = new UserAgent({ platform: 'Win32' });

export const gotoPage = async (
  browser: Browser,
  link: string,
): Promise<Page> => {
  const page = await browser.newPage();

  try {
    await page.setUserAgent(userAgent.random().toString());

    await page.goto(link, {
      waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
    });

    await utils.delay(30000);

    return page;
  } catch (error) {
    await page.close();
    return gotoPage(browser, link);
  }
};
