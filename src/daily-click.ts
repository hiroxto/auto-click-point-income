import puppeteer, { Browser, Headers, LaunchOptions, Page } from 'puppeteer';
import { URLClicker } from './url-clicker';

export class DailyClick {
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
      await page.goto('https://pointi.jp/daily.php');
      const unClickedUrls = await this.pickUnClickedUrls(page);
      console.log(`UnClicked Urls count : ${unClickedUrls.length}`);
      const clicker = new URLClicker(this.browser, unClickedUrls);

      if (clicker.isExecutable()) {
        clicker.displayUrls();
        await clicker.execute();
      } else {
        console.log('実行可能URLが存在しません.');
      }
    } catch (e) {
      console.log(e);
    } finally {
      await this.browser.close();
    }
  }

  /**
   * 未クリックのURLを抽出する
   *
   * @param page
   */
  async pickUnClickedUrls (page: Page): Promise<string[]> {
    return await page.$$eval<string[]>('div.click_btn', (elements: HTMLDivElement[]) => {
      return elements.map(element => {
        const parent = element.parentElement as HTMLAnchorElement;
        return parent.href;
      });
    });
  }
}
