const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src');

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Deep surface (13,16,34) -> Deep Olive (26,37,23)
            content = content.replace(/rgba\(\s*13\s*,\s*16\s*,\s*34\s*/g, 'rgba(26,37,23');
            
            // Border/lighter surface (28,34,64) -> Lighter Olive (45,59,39)
            content = content.replace(/rgba\(\s*28\s*,\s*34\s*,\s*64\s*/g, 'rgba(45,59,39');
            
            // Background shadow/insets (6,8,17) -> Darkest Olive (17,24,16)
            content = content.replace(/rgba\(\s*6\s*,\s*8\s*,\s*17\s*/g, 'rgba(17,24,16');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated dark overlays in:', fullPath);
            }
        }
    });
}

traverse(srcDir);
