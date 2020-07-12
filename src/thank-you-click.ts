import puppeteer, { Headers, LaunchOptions, Page } from 'puppeteer';

export class ThankYouClick {
  launchOptions: LaunchOptions;
  headers: Headers;

  constructor (launchOptions: LaunchOptions, headers: Headers) {
    this.launchOptions = launchOptions;
    this.headers = headers;
  }

  async start (): Promise<void> {
    const browser = await puppeteer.launch(this.launchOptions);

    try {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders(this.headers);
      await page.goto('https://pointi.jp/contents/39_news/');
      const lastPageNumber = await this.getLastPageNumber(page);

      for (let pageNumber = 1; pageNumber <= lastPageNumber; pageNumber++) {
        const unreadAdUrls = await this.getUnreadAdUrls(page);

        // 次のページへ移動
        await Promise.all([
          page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
          page.click('a[class="next"]'),
        ]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      await browser.close();
    }
  }

  /**
   * 最終ページ番号を取得する
   */
  async getLastPageNumber (page: Page): Promise<number> {
    const anchors = await page.evaluate((): Element[] => {
      const anchorList = [];
      const nodeList = document.querySelectorAll<HTMLAnchorElement>('div.pager.clearfix > a');
      console.log(nodeList);
      nodeList.forEach(el => {
        anchorList.push(el.text);
      });

      return anchorList;
    });

    const lastPageAnchorText = anchors[anchors.length - 2];

    return Number(lastPageAnchorText);
  }

  /**
   * 未読の広告 URL を取得する
   * @param page
   */
  async getUnreadAdUrls (page: Page): Promise<string[]> {
    return await page.evaluate((): string[] => {
      const urlsList: string[] = [];
      const nodeList = document.querySelectorAll<HTMLAnchorElement>('ul#link_list > li > a');
      nodeList.forEach(el => {
        const href = el.href;
        const stampImg = el.querySelectorAll<HTMLImageElement>('div.list_img > img.list_stamp_img');
        if (stampImg.length === 0) {
          urlsList.push(href);
        }
      });

      return urlsList;
    });
  }
}
