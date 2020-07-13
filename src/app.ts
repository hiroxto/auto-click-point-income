import { Headers, LaunchOptions } from 'puppeteer';
import { MailClick } from './mail-click';
import { ShoppingClick } from './shopping-click';
import { ThankYouClick } from './thank-you-click';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

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

const startMailClick = async (): Promise<void> => {
  const mailClick = new MailClick(launchOptions, headers);
  await mailClick.start();
};

const startShoppingClick = async (): Promise<void> => {
  const shoppingClick = new ShoppingClick(launchOptions, headers);
  await shoppingClick.start();
};

const startThankYouClick = async (): Promise<void> => {
  const thankYouClick = new ThankYouClick(launchOptions, headers);
  await thankYouClick.start();
};

const main = async (): Promise<void> => {
  await startMailClick();
  await startShoppingClick();
  await startThankYouClick();
};

console.log(main());
