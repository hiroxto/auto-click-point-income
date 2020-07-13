import { Browser } from 'puppeteer';

export class URLClicker {
  browser: Browser;
  urls: string[];

  constructor (browser: Browser, urls: string[]) {
    this.browser = browser;
    this.urls = urls;
  }

  /**
   * 広告 URL へのアクセスを実行する
   */
  async execute (): Promise<void> {
    await Promise.all(this.urls.map(async url => {
      console.log(`Access to ${url}`);
      const page = await this.browser.newPage();

      try {
        await page.setDefaultNavigationTimeout(0);
        await page.goto(url);
        await page.close();
        console.log(`Finish access to ${url}`);
      } catch (e) {
        console.log(e);
      } finally {
        await page.close();
      }

      return url;
    }));
  }

  /**
   * コマンドが実行可能かを確認する
   */
  isExecutable (): boolean {
    return this.urls.length > 0;
  }

  /**
   * URL 一覧を表示する.
   */
  displayUrls (): string {
    const joinedUrls = this.urls.join('\n');
    console.log(joinedUrls);
    return joinedUrls;
  }

  /**
   * 実行するコマンドを作成する
   */
  private buildCommand (): string {
    const joinedUrls = this.urls.map(u => `"${u}"`).join(' ');

    return `curl -L ${joinedUrls} >> /dev/null`;
  }
}
