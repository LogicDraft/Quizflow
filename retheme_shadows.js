const fs = require('fs');
const path = require('path');

const cssFile = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src/index.css');

let content = fs.readFileSync(cssFile, 'utf8');
let original = content;

// Replace heavy shadows with light theme shadows
content = content.replace(/rgba\(0,0,0,0\.4\)/g, 'rgba(13,22,12,0.15)');
content = content.replace(/rgba\(0,0,0,0\.3\)/g, 'rgba(13,22,12,0.1)');
content = content.replace(/rgba\(0,0,0,0\.5\)/g, 'rgba(13,22,12,0.2)');

if (content !== original) {
    fs.writeFileSync(cssFile, content);
    console.log('Softened shadows in index.css');
}
