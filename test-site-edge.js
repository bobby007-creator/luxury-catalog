const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: "new"
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
    
    console.log('Navigating to Netlify...');
    await page.goto('https://pvrdigitalcatalog.netlify.app', { waitUntil: 'networkidle0' });
    console.log('Done.');
    
    await browser.close();
  } catch (e) {
    console.error('Script Error:', e);
  }
})();
