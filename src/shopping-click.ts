import puppeteer, { Browser, Headers, LaunchOptions } from 'puppeteer';

export class ShoppingClick {
  launchOptions: LaunchOptions;
  headers: Headers;
  browser: Browser;

  constructor (launchOptions: LaunchOptions, headers: Headers) {
    this.launchOptions = launchOptions;
    this.headers = headers;
  }

  async start (): Promise<void> {
    this.browser = await puppeteer.launch(this.launchOptions);

    try {
      const page = await this.browser.newPage();
      await page.setExtraHTTPHeaders(this.headers);
      await page.goto('https://pointi.jp/shopping/');
    } catch (e) {
      console.log(e);
    } finally {
      await this.browser.close();
    }
  }
}
