import puppeteer, { PuppeteerLaunchOptions } from 'puppeteer';
import { logger } from '../../helpers';

export const launchBrowser = async (
  { headless = true } = {} as PuppeteerLaunchOptions,
) => {
  logger.verbose('Connecting to Scraping Browser...');

  const browser = await puppeteer.launch({
    headless,
    defaultViewport: { width: 1920, height: 1024 },
  });

  logger.verbose('Connected to Scraping Browser!');

  return { browser };
};
