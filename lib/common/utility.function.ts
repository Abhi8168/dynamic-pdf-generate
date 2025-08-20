import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import puppeteer from 'puppeteer';
import * as randomString from 'randomstring';

export const createPath = (dir: string): boolean => {
  try {
    if (existsSync(dir)) return true;
    else {
      mkdirSync(dir, { recursive: true });
      return true;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const generatePDFBuffer = async (htmlContent: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page: any = await browser.newPage();

  // Load HTML and wait for network requests to settle
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  console.log('HTML content set on page');

  // ✅ Ensure all images are loaded or timeout after 10s
  await page.evaluate(async () => {
    const timeout = (ms: number) => new Promise((res) => setTimeout(res, ms));

    async function waitForImage(img: HTMLImageElement) {
      if (img.complete && img.naturalHeight !== 0) return;
      return new Promise((resolve) => {
        const done = () => resolve(true);
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    }

    const promises = Array.from(document.images).map(
      (img) => Promise.race([waitForImage(img), timeout(10000)]), // 10s max per image
    );

    await Promise.all(promises);
  });
  console.log('All images attempted (loaded or timed out)');

  // Apply print CSS
  await page.emulateMediaType('print');

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true, // Ensures backgrounds and colors are printed
    // margin: {
    //   top: '0.1mm',
    //   right: '0.1mm',
    //   bottom: '0.1mm',
    //   left: '0.1mm',
    // },
  });

  await browser.close();
  return pdfBuffer;
};

export const servePdf = (res: any, path: string) => {
  if (existsSync(path)) {
    try {
      const file = createReadStream(path);
      return file.pipe(res);
    } catch (e) {
      console.error(e.name);
      if (e.name === 'ENOENT') {
        throw new BadRequestException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  throw new NotFoundException();
};
export const generateRandomToken = () => {
  // Set the expiration time to 24 hours (24 * 60 * 60 seconds)
  const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // UNIX timestamp in seconds
  const random = `${randomString.generate()}|${expirationTime}`; // Include the expiry time in the token
  return random;
};

export const parseBoolean = (arg0: any) => {
  if (/^true$/i.test(arg0)) return true;
  else if (/^false$/i.test(arg0)) return false;
  else {
    throw new Error('Parameter is not a valid value');
  }
};
