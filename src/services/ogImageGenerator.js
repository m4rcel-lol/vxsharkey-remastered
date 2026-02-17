import puppeteer from 'puppeteer-core';
import { cache } from '../server.js';
import { stripHtml, truncateText } from '../utils/sanitizer.js';

const OG_IMAGE_ENABLED = process.env.OG_IMAGE_ENABLED !== 'false';
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser';

let browser = null;

/**
 * Initialize Puppeteer browser instance
 */
async function getBrowser() {
  if (browser) {
    return browser;
  }

  try {
    browser = await puppeteer.launch({
      executablePath: CHROMIUM_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      headless: true,
    });
    return browser;
  } catch (error) {
    console.error('Failed to launch browser:', error);
    return null;
  }
}

/**
 * Generates an OG image for a note
 */
export async function generateOgImage(note, domain) {
  if (!OG_IMAGE_ENABLED) {
    return null;
  }

  const cacheKey = `og-image:${domain}:${note.id}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const browser = await getBrowser();
    if (!browser) {
      return null;
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    const html = generateOgImageHtml(note, domain);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 630,
      },
    });

    await page.close();

    cache.set(cacheKey, screenshot);
    return screenshot;
  } catch (error) {
    console.error('Error generating OG image:', error);
    return null;
  }
}

/**
 * Generates HTML for OG image rendering
 */
function generateOgImageHtml(note, domain) {
  const text = truncateText(stripHtml(note.text || ''), 300);
  const username = note.user.name || note.user.username;
  const avatar = note.user.avatarUrl || '';
  const hasQuote = note.renote && note.text;
  const hasFiles = note.files && note.files.length > 0;

  let filesHtml = '';
  if (hasFiles) {
    const images = note.files.filter(f => f.type.startsWith('image')).slice(0, 4);
    if (images.length > 0) {
      const gridClass = images.length === 1 ? 'grid-1' : images.length === 2 ? 'grid-2' : images.length === 3 ? 'grid-3' : 'grid-4';
      filesHtml = `
        <div class="files ${gridClass}">
          ${images.map(img => `<img src="${img.thumbnailUrl || img.url}" alt="" />`).join('')}
        </div>
      `;
    }
  }

  let quoteHtml = '';
  if (hasQuote) {
    const quoteText = truncateText(stripHtml(note.renote.text || ''), 100);
    const quoteUsername = note.renote.user.name || note.renote.user.username;
    quoteHtml = `
      <div class="quote">
        <div class="quote-header">
          <img src="${note.renote.user.avatarUrl || ''}" alt="" class="quote-avatar" />
          <span class="quote-username">${quoteUsername}</span>
        </div>
        <div class="quote-text">${quoteText}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          padding: 40px;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-right: 20px;
          object-fit: cover;
        }
        .username {
          font-size: 36px;
          font-weight: 700;
        }
        .domain {
          font-size: 24px;
          color: #aaa;
          margin-top: 5px;
        }
        .content {
          flex: 1;
          font-size: 28px;
          line-height: 1.5;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .files {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
          max-height: 250px;
        }
        .files.grid-1 {
          grid-template-columns: 1fr;
        }
        .files.grid-2 {
          grid-template-columns: 1fr 1fr;
        }
        .files.grid-3 {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .files.grid-4 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }
        .files img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .quote {
          background: rgba(255, 255, 255, 0.1);
          border-left: 4px solid #4a9eff;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }
        .quote-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .quote-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .quote-username {
          font-size: 20px;
          font-weight: 600;
        }
        .quote-text {
          font-size: 20px;
          color: #ddd;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 24px;
          color: #888;
          margin-top: auto;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${avatar}" alt="" class="avatar" onerror="this.style.display='none'" />
        <div>
          <div class="username">${username}</div>
          <div class="domain">@${domain}</div>
        </div>
      </div>
      <div class="content">${text}</div>
      ${filesHtml}
      ${quoteHtml}
      <div class="footer">
        <span>🦈 vxsharkey • by m5rcode</span>
      </div>
    </body>
    </html>
  `;
}

/**
 * Cleanup browser instance
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
