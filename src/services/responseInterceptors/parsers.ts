import { HTTPResponse } from 'puppeteer';

export abstract class Parsers {
  response: HTTPResponse | null = null;
  outputPath: string;
  fileNamePrefix: string;

  constructor(outputPath: string, fileNamePrefix: string) {
    this.outputPath = outputPath;
    this.fileNamePrefix = fileNamePrefix;
  }

  abstract shouldParse(): Promise<boolean>;

  abstract parseContent(
    response: HTTPResponse,
    options?: unknown,
  ): Promise<unknown>;
}
