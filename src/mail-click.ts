import puppeteer, { Browser, Headers, LaunchOptions, Page } from 'puppeteer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = require('child_process').exec;

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
      const page = await this.browser.newPage();
      await page.setExtraHTTPHeaders(this.headers);
      await page.goto('https://pointi.jp/my/my_page.php');
      const mailMagazineUrls = await this.getMailMagazineUrls(page);

      await mailMagazineUrls.map(async (mailMagazineUrl) => {
        console.log(mailMagazineUrl);
        const urls = await this.openMailMagazines(mailMagazineUrl);
        const joinedUrls = urls.map(u => `"${u}"`).join(' ');
        console.log(urls.join('\n'));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
        exec(`curl -L ${joinedUrls} >> /dev/null`, (_err, _stdout, _stderr) => {});
      });
    } catch (e) {
      console.log(e);
    } finally {
      await this.browser.close();
    }
  }

  async getMailMagazineUrls (page: Page): Promise<string[]> {
    const urls = await page.evaluate((): string[] => {
      const urlList = [];
      const nodeList = document.querySelectorAll<HTMLAnchorElement>('.box_ad.notyet > td > a.txt_elli');
      nodeList.forEach(node => {
        urlList.push(node.href);
      });

      return urlList;
    });

    return urls;
  }

  async openMailMagazines (mailMagazineUrl: string): Promise<string[]> {
    const page = await this.browser.newPage();

    try {
      await page.setExtraHTTPHeaders(this.headers);
      await page.goto(mailMagazineUrl);
      const urls = await page.evaluate(() => {
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

      await page.close();

      return urls;
    } catch (e) {
      console.log(e);
      await page.close();
      throw e;
    }
  }
}
