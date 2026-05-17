const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'header.html' && f !== 'sidebar.html');

files.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html, { recognizeSelfClosing: true });
    const main = $('main');

    if (main.length) {
        // Completely standardized <main> class
        main.attr('class', 'flex-1 flex flex-col h-screen overflow-y-auto bg-background relative');

        // Note: For Create-new-order.html where body scrolls, making main h-screen overflow-y-auto 
        // will make the main scroll independently, which is actually the correct SPA behavior!
        
        // Let's remove md:ml-[260px] from any parent wrappers since sidebar.js handles layout automatically!
        // Wait, sidebar.js automatically removes md:ml-[260px] anyway:
        // offsetClasses.forEach(function (className) { ... remove(className) ... });
        // So that's fine.

        const children = main.children().toArray();
        let headerRoot = null;
        let scripts = [];
        let contentToWrap = [];

        children.forEach(child => {
            if ($(child).attr('id') === 'header-root') {
                headerRoot = child;
            } else if (child.tagName === 'script') {
                scripts.push(child);
            } else {
                contentToWrap.push(child);
            }
        });

        if (contentToWrap.length > 0) {
            let isWrapped = false;
            let wrapper = null;

            if (contentToWrap.length === 1 && contentToWrap[0].tagName === 'div') {
                const w = $(contentToWrap[0]);
                const wClass = w.attr('class') || '';
                if (wClass.includes('p-container-margin')) {
                    isWrapped = true;
                    wrapper = w;
                }
            }

            if (isWrapped) {
                // Ensure wrapper has no extra weird top margins
                let wClass = wrapper.attr('class') || '';
                wClass = wClass.split(' ').filter(c => {
                    return !c.startsWith('mt-[') && !c.startsWith('pt-[') && !c.startsWith('pt-') && !c.startsWith('mt-');
                }).join(' ');
                
                // Set explicitly for perfection
                wrapper.attr('class', 'p-container-margin w-full max-w-[1600px] mx-auto flex-1 flex flex-col gap-6');
            } else {
                // Should already be wrapped from previous script, but just in case
                wrapper = $('<div class="p-container-margin w-full max-w-[1600px] mx-auto flex-1 flex flex-col gap-6"></div>');
                contentToWrap.forEach(child => wrapper.append(child));
            }

            main.empty();
            if (headerRoot) main.append(headerRoot);
            main.append(wrapper);
            scripts.forEach(s => main.append(s));
        }
    }

    fs.writeFileSync(file, $.html());
});

console.log("HTML completely standardized successfully.");
