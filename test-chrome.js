const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    console.log('Navigating to Netlify...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Done.');
    
    const html = await page.content();
    if (html.includes("This page couldn't load")) {
        console.log("CRASH DETECTED in HTML!");
    } else {
        console.log("SUCCESS! No crash screen detected.");
    }
    
    await browser.close();
  } catch (e) {
    console.error('Script Error:', e);
    process.exit(1);
  }
})();
