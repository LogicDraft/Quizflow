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

            // Strip static white text styles
            content = content.replace(/color:\s*"white"/g, 'color: "var(--text)"');
            content = content.replace(/color:\s*"#fff"/gi, 'color: "var(--text)"');
            content = content.replace(/color:\s*"#ffffff"/gi, 'color: "var(--text)"');
            content = content.replace(/color:\s*"rgba\(255,255,255,([^"]*)\)"/g, 'color: "rgba(22,32,18,$1)"'); // dark olive transparency

            // Rewrite translucent white borders and backgrounds to deep olive transparent for frosted glass
            content = content.replace(/rgba\(255,255,255,0.05\)/g, 'rgba(26,37,23,0.05)');
            content = content.replace(/rgba\(255, 255, 255, 0.05\)/g, 'rgba(26, 37, 23, 0.05)');
            content = content.replace(/rgba\(255,255,255,0.1\)/g, 'rgba(26,37,23,0.1)');
            content = content.replace(/rgba\(255, 255, 255, 0.1\)/g, 'rgba(26, 37, 23, 0.1)');
            content = content.replace(/rgba\(255,255,255,0.15\)/g, 'rgba(26,37,23,0.15)');
            content = content.replace(/rgba\(255,255,255,0.2\)/g, 'rgba(26,37,23,0.2)');
            content = content.replace(/rgba\(255,255,255,0.3\)/g, 'rgba(26,37,23,0.3)');

            // Remove pure black backgrounds for contrast (like previously mapped Dark Olive backgrounds) and replace to glass equivalents if hardcoded
            // In my previous pass, I replaced dark blues to Dark Olives.
            // Let's replace the Dark Olive (26,37,23) in RGBA to Light Glass RGBA (237,245,233 / rgba(237,245,233))
            content = content.replace(/rgba\(26,37,23,0.5\)/g, 'rgba(237,245,233,0.6)');
            content = content.replace(/rgba\(45,59,39,0.5\)/g, 'rgba(237,245,233,0.8)');
            content = content.replace(/rgba\(17,24,16,0.6\)/g, 'rgba(237,245,233,0.9)');
            
            // And also replace `rgba(0,0,0,0.2)` which was used on avatar icons to something more appropriate for a light theme
            content = content.replace(/rgba\(0,0,0,0.2\)/g, 'rgba(26,37,23,0.08)');
            content = content.replace(/rgba\(0,0,0,0.5\)/g, 'rgba(26,37,23,0.15)');


            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Migrated to light minimal UI in:', fullPath);
            }
        }
    });
}

traverse(srcDir);
