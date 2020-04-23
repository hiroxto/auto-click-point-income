import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
const exec = require('child_process').exec;

dotenv.config();

const headers = {
  'User-Agent': process.env.USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
  DNT: '1',
  Connection: 'keep-alive',
  Cookie: process.env.COOKEI,
  'Upgrade-Insecure-Requests': '1',
};

async function main () {
  const browser = await puppeteer.launch();

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
      exec(`curl -L ${joinedUrls} >> /dev/null`, (_err, _stdout, _stderr) => {});
    });
  } catch (e) {
    console.log(e);
  } finally {
    browser.close();
  }
}

async function getMailMagazineUrls (page) {
  const urls = await page.evaluate(() => {
    const urlList = [];
    const nodeList = document.querySelectorAll('.box_ad.notyet > td > a.txt_elli');
    nodeList.forEach(node => {
      urlList.push(node.href);
    });

    return urlList;
  });

  return urls;
}

async function openMailMagazines (mailMagazineUrl) {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(headers);
    await page.goto(mailMagazineUrl);
    const urls = await page.evaluate(() => {
      const mailMagazineUrls = [];
      const nodes = document.querySelectorAll('#mymail > pre.magagine_detail_txt > a');
      nodes.forEach(node => {
        const hrefValue = node.href;

        if (hrefValue.match(/click_mail_magazine/)) {
          mailMagazineUrls.push(hrefValue);
        }
      });

      return mailMagazineUrls;
    });

    browser.close();

    return urls;
  } catch (e) {
    console.log(e);

    browser.close();
    throw e;
  }
}

console.log(main());
