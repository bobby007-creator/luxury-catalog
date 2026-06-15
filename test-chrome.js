const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        } else {
            console.log('PAGE LOG:', msg.text());
        }
    });
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    console.log('Navigating to Netlify...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // wait for 2 seconds to ensure catalog is loaded
    await new Promise(r => setTimeout(r, 2000));
    
    // click the first "Preview in Room" button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const previewBtn = btns.find(b => b.innerText.includes('Preview in Room'));
      if (previewBtn) previewBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    console.log('Done.');
    
    await page.screenshot({ path: 'screenshot.png' });
    
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
