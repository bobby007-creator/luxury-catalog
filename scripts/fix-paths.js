const fs = require('fs');
const path = require('path');

function replaceAbsolutePaths(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceAbsolutePaths(fullPath);
    } else {
      if (['.html', '.js', '.css'].includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        // Replace absolute Next paths
        content = content.replace(/(href|src)="\//g, \="./);
        content = content.replace(/url\(\//g, url(./);
        content = content.replace(/"\/_next\//g, "./_next/);
        content = content.replace(/"\/images\//g, "./images/);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
replaceAbsolutePaths(path.join(__dirname, '..', 'out'));
