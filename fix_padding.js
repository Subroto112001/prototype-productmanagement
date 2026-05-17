const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove all padding classes from <main>
  content = content.replace(/(<main[^>]*?class=")([^"]*)("[^>]*>)/, (match, p1, p2, p3) => {
    let classes = p2.split(' ');
    classes = classes.filter(c => !c.match(/^p[xybtlr]?-(container-margin|\d+|\[.*?\])$/) && c !== 'md:ml-[260px]' && c !== 'ml-0' && c !== 'mt-16' && c !== 'mt-[50px]');
    return p1 + classes.join(' ') + p3;
  });

  // 2. Change `p-8` to `p-container-margin` to align with the rest of the app's padding 
  // ONLY if it's the wrapper div after header-root or main
  content = content.replace(/class="([^"]*)p-8([^"]*)"/, (match, p1, p2) => {
    return 'class="' + p1 + 'p-container-margin' + p2 + '"';
  });
  
  // Replace missing wrapper padding for some pages if they had it on <main>
  // Actually, we'll manually check and add the wrapper if it doesn't exist
  fs.writeFileSync(file, content);
});
console.log('Padding classes removed from <main>');
