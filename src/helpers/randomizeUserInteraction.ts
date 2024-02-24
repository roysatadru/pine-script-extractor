import { Page } from 'puppeteer';
import * as utils from '../utils';

const randomTimeBetween = (min: number, max: number) => {
  const randomTime = Math.random() * (max - min) + min;

  // round off to 0 decimal places and convert to milliseconds (from seconds)
  return Math.round(randomTime * 1000);
};

export const randomizeUserInteraction = async (page: Page) => {
  const originalClick = page.click.bind(page);
  const originalType = page.type.bind(page);
  const originalWaitForSelector = page.waitForSelector.bind(page);

  async function click(...args: Parameters<Page['click']>) {
    const [selector, options = {}] = args;

    await utils.delay(randomTimeBetween(1, 4));
    await originalWaitForSelector(selector);
    await originalClick(selector, {
      delay: randomTimeBetween(0.2, 1.5),
      ...options,
    });
  }

  async function type(...args: Parameters<Page['type']>) {
    const [selector, text, options = {}] = args;

    await utils.delay(randomTimeBetween(1, 4));
    await originalWaitForSelector(selector);
    await originalType(selector, text, {
      delay: randomTimeBetween(0.2, 1.5),
      ...options,
    });
  }

  page.click = click;
  page.type = type;

  return page as Page;
};
