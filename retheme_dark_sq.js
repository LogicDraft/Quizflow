const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src');

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Replace input fields
            content = content.replace(/className="qf-input(.*)"/g, 'className="input-sq$1"');
            content = content.replace(/className={`qf-input(.*)`}/g, 'className={`input-sq$1`}');

            // Replace Buttons 
            content = content.replace(/className="btn-primary(.*)"/g, 'className="btn-primary-sq w-full$1"');
            content = content.replace(/className={`btn-primary(.*)`}/g, 'className={`btn-primary-sq w-full$1`}');

            // Replace internal glass cards
            content = content.replace(/className="glass(.*)"/g, 'className="glass-card-sq$1"');
            content = content.replace(/className="glass-bright(.*)"/g, 'className="glass-card-sq$1"');
            content = content.replace(/className={`glass(.*)`}/g, 'className={`glass-card-sq$1`}');

            // Replace inline background transparency
            content = content.replace(/background:\s*"rgba\([^)]*\)"/g, 'background: "transparent"');

            // Set main fonts
            content = content.replace(/var\(--font-display\)/g, 'var(--font-inter)');
            content = content.replace(/var\(--font-body\)/g, 'var(--font-inter)');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Migrated to Dark SQ Tailwind UI in:', fullPath);
            }
        }
    });
}

traverse(srcDir);
