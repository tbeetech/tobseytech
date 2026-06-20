const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.md')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/Administrator/arcolytetech/Arcolyte/client/src');
files.push('c:/Users/Administrator/arcolytetech/Arcolyte/README.md');

let fixedCount = 0;
files.forEach(file => {
    const original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    // Replace mojibake
    content = content.replace(/â†’/g, '→');
    content = content.replace(/â€¢/g, '•');
    content = content.replace(/âœ“/g, '✓');
    content = content.replace(/â€¦/g, '…');
    content = content.replace(/â€”/g, '—');
    
    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
        fixedCount++;
    }
});
console.log('Fixed ' + fixedCount + ' files.');
