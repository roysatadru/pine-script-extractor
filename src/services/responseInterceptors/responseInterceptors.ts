import { Page } from 'puppeteer';
import { Parsers } from './parsers';

export class ResponseInterceptors {
  private asyncCalls: Promise<void>[] = [];
  private page: Page;

  constructor(page: Page, parsers: Parsers[]) {
    this.page = page;
    page.on('response', async (response) => {
      this.asyncCalls = parsers.map(async (parser) => {
        parser.response = response;
        await parser.parseContent(response, {
          page,
        });
      });
    });
  }

  public async waitForAll() {
    await Promise.all(this.asyncCalls);
    this.page.removeAllListeners('response');
  }
}
