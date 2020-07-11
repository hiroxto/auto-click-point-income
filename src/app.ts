import puppeteer, { Headers, LaunchOptions, Page } from 'puppeteer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = require('child_process').exec;

dotenv.config();

const launchOptions: LaunchOptions = {};

const headers: Headers = {
  'User-Agent': process.env.USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
  DNT: '1',
  Connection: 'keep-alive',
  Cookie: process.env.COOKEI,
  'Upgrade-Insecure-Requests': '1',
};

async function main () {
  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(headers);
    await page.goto('https://pointi.jp/my/my_page.php');
    const mailMagazineUrls = await getMailMagazineUrls(page);

    await mailMagazineUrls.map(async (mailMagazineUrl) => {
      console.log(mailMagazineUrl);
      const urls = await openMailMagazines(mailMagazineUrl);
      const joinedUrls = urls.map(u => `"${u}"`).join(' ');
      console.log(urls.join('\n'));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
      exec(`curl -L ${joinedUrls} >> /dev/null`, (_err, _stdout, _stderr) => {});
    });
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
}

async function getMailMagazineUrls (page: Page) : Promise<string[]> {
  const urls = await page.evaluate((): string[] => {
    const urlList = [];
    const nodeList = document.querySelectorAll('.box_ad.notyet > td > a.txt_elli');
    nodeList.forEach(node => {
      urlList.push(node.getAttribute('href'));
    });

    return urlList;
  });

  return urls;
}

async function openMailMagazines (mailMagazineUrl: string) {
  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(headers);
    await page.goto(mailMagazineUrl);
    const urls = await page.evaluate(() => {
      const mailMagazineUrls = [];
      const nodes = document.querySelectorAll('#mymail > pre.magagine_detail_txt > a');
      nodes.forEach(node => {
        const hrefValue = node.getAttribute('href');

        if (hrefValue.match(/click_mail_magazine/)) {
          mailMagazineUrls.push(hrefValue);
        }
      });

      return mailMagazineUrls;
    });

    await browser.close();

    return urls;
  } catch (e) {
    console.log(e);

    await browser.close();
    throw e;
  }
}

console.log(main());
