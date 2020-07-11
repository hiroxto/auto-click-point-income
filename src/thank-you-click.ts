import { Headers, LaunchOptions } from 'puppeteer';

export class ThankYouClick {
  launchOptions: LaunchOptions;
  headers: Headers;

  constructor (launchOptions: LaunchOptions, headers: Headers) {
    this.launchOptions = launchOptions;
    this.headers = headers;
  }

  async start (): Promise<void> {
  }
}
