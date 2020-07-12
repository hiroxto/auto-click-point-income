import puppeteer, { Browser, Headers, LaunchOptions, Page } from 'puppeteer';
import { URLClicker } from './url-clicker';

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
      const unClickedUrls = await this.pickUnClickedUrls(page);
      const clicker = new URLClicker(unClickedUrls);

      if (clicker.isExecutable()) {
        clicker.displayUrls();
        clicker.execute();
      } else {
        console.log('実行可能URLが存在しません.')
      }
    } catch (e) {
      console.log(e);
    } finally {
      await this.browser.close();
    }
  }

  /**
   * 未クリックの広告 URL を取得する
   * href に click_incentive が含まれていて, クラスに off_btn が含まれていない a タグを抽出
   * @param page
   */
  async pickUnClickedUrls (page: Page) :Promise<string[]> {
    return await page.$$eval<string[]>('a.go_btn', (elements: HTMLAnchorElement[]) => {
      return elements.filter(el => el.href.match(/click_incentive/) && !el.classList.contains('off_btn'))
        .map(el => el.href);
    });
  }
}
