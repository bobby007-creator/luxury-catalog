const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing offline build...');

const filesToHide = [
  path.join(__dirname, '..', 'src', 'app', 'api', 'branding', 'route.js'),
  path.join(__dirname, '..', 'src', 'app', 'api', 'config', 'route.js'),
  path.join(__dirname, '..', 'src', 'app', 'api', 'upload', 'route.js'),
  path.join(__dirname, '..', 'src', 'app', 'api', 'catalog', 'route.js'),
  path.join(__dirname, '..', 'src', 'app', 'admin', 'page.js')
];

const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.js');
let pageContentOriginal = '';

// Hide API and Admin routes by renaming them
filesToHide.forEach(file => {
  if (fs.existsSync(file)) {
    fs.renameSync(file, file + '.bak');
  }
});

// Remove force-dynamic for static export
if (fs.existsSync(pagePath)) {
  pageContentOriginal = fs.readFileSync(pagePath, 'utf8');
  let modifiedContent = pageContentOriginal.replace("export const dynamic = 'force-dynamic';", "// export const dynamic = 'force-dynamic';");
  modifiedContent = modifiedContent.replace("export const revalidate = 0;", "// export const revalidate = 0;");
  fs.writeFileSync(pagePath, modifiedContent);
}

try {
  // Run next build with OFFLINE_BUILD=true
  console.log('Running Next.js build...');
  execSync('set OFFLINE_BUILD=true&& npx next build', { stdio: 'inherit', shell: true });
  console.log('\n✅ Offline build successfully generated in the "out" folder!');

  // Copy to Desktop
  const outPath = path.join(__dirname, '..', 'out');
  const desktopPath = path.join(process.env.USERPROFILE, 'Desktop', 'LuxuryCatalogOffline');
  
  if (fs.existsSync(outPath)) {
    console.log(`Fixing absolute paths for Android file:// support...`);
    function replaceAbsolutePaths(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          replaceAbsolutePaths(fullPath);
        } else {
          if (['.html', '.js', '.css'].includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/(href|src)="\//g, '$1="./');
            content = content.replace(/url\(\//g, 'url(./');
            content = content.replace(/"\/_next\//g, '"./_next/');
            content = content.replace(/"\/images\//g, '"./images/');
            fs.writeFileSync(fullPath, content);
          }
        }
      }
    }
    replaceAbsolutePaths(outPath);

    console.log(`Copying offline app to Desktop: ${desktopPath}`);
    fs.cpSync(outPath, desktopPath, { recursive: true });
    console.log('✅ Successfully copied to Desktop!');
  }

} catch (err) {
  console.error('\n❌ Offline build failed!', err.message);
} finally {
  // Restore files
  console.log('Restoring dev routes...');
  filesToHide.forEach(file => {
    if (fs.existsSync(file + '.bak')) {
      fs.renameSync(file + '.bak', file);
    }
  });

  if (pageContentOriginal) {
    fs.writeFileSync(pagePath, pageContentOriginal);
  }
}
