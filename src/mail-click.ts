import puppeteer, { Browser, Headers, LaunchOptions, Page } from 'puppeteer';
import { URLClicker } from './url-clicker';

export class MailClick {
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
      const page = await this.createNewPage('https://pointi.jp/my/my_page.php');
      const mailMagazineUrls = await this.getUnreadMailMagazineUrls(page);

      console.log(`Unread mail magazines count : ${mailMagazineUrls.length}`);

      await Promise.all(mailMagazineUrls.map(async (mailMagazineUrl) => {
        console.log(mailMagazineUrl);
        const mailMagazinePage = await this.createNewPage(mailMagazineUrl);
        const clickableUrls = await this.pickClickableUrls(mailMagazinePage);
        const clicker = new URLClicker(this.browser, clickableUrls);

        if (clicker.isExecutable()) {
          clicker.displayUrls();
          await clicker.execute();
        } else {
          console.log('実行可能URLが存在しません.');
        }
      }));
    } catch (e) {
      console.log(e);
    } finally {
      await this.browser.close();
    }
  }

  /**
   * 未読のメールマガジンのURLを取得する
   * @param page
   */
  async getUnreadMailMagazineUrls (page: Page): Promise<string[]> {
    return await page.$$eval<string[]>('.box_ad.notyet > td > a.txt_elli', (elements: HTMLAnchorElement[]) => {
      return elements.map(element => element.href);
    });
  }

  /**
   * メールマガジンのページからクリック可能なURLを抽出する
   *
   * @param mailMagazinePage
   */
  async pickClickableUrls (mailMagazinePage: Page): Promise<string[]> {
    return await mailMagazinePage.evaluate(() => {
      const mailMagazineUrls = [];
      const nodes = document.querySelectorAll<HTMLAnchorElement>('#mymail > pre.magagine_detail_txt > a');
      nodes.forEach(node => {
        const hrefValue = node.href;

        if (hrefValue.match(/click_mail_magazine/)) {
          mailMagazineUrls.push(hrefValue);
        }
      });

      return mailMagazineUrls;
    });
  }

  /**
   * HTTPヘッダーやタイムアウトの設定を済ませた新しいページを作成する
   *
   * @param url
   */
  async createNewPage (url: string): Promise<Page> {
    const page = await this.browser.newPage();
    await page.setExtraHTTPHeaders(this.headers);
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url);

    return page;
  }
}
