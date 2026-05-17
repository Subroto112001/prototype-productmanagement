const fs = require('fs');
const path = require('path');
const dir = 'd:/Farid/Prototype';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove pt-16, mt-16, pt-24, pt-[88px], mt-[50px] from <main>
  content = content.replace(/<main[^>]*>/, match => {
    return match.replace(/\s+(pt-16|mt-16|pt-24|pt-\[88px\]|mt-\[50px\])/g, '');
  });

  // Remove mt-[70px]
  content = content.replace(/mt-\[70px\]/g, '');

  fs.writeFileSync(filePath, content);
});
console.log('Fixed margins on all HTML files.');
