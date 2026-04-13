const fs = require('fs');
const path = require('path');

const file = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src/pages/HomePage.jsx');

let content = fs.readFileSync(file, 'utf8');
let original = content;

// Remove inline onFocus / onBlur to allow Tailwind rules from index.css to govern states naturally
content = content.replace(/onFocus=\{e => \{ e\.target\.style\.borderColor = "var\(--cyan\)"; e\.target\.style\.boxShadow = "0 0 0 3px rgba\(172,200,162,0\.12\)"; e\.target\.select\(\); \}\}/g, 'onFocus={e => e.target.select()}');
content = content.replace(/onBlur=\{e\s*=> \{ e\.target\.style\.borderColor = pin\.length===6 \? "var\(--green\)" : "var\(--border\)"; e\.target\.style\.boxShadow = pin\.length===6 \? "0 0 12px rgba\(163,196,152,0\.25\)" : "none"; \}\}/g, '');

content = content.replace(/onFocus=\{e => \{ e\.target\.style\.borderColor = "var\(--violet\)"; e\.target\.style\.boxShadow = "0 0 0 3px rgba\(104,138,93,0\.12\)"; \}\}/g, '');
content = content.replace(/onBlur=\{e\s*=> \{ e\.target\.style\.borderColor = "var\(--border\)"; e\.target\.style\.boxShadow = "none"; \}\}/g, '');

// Clean up inline styles for OTP input overrides 
content = content.replace(/boxShadow:\s*pin\.length === 6.*\n/g, '');
content = content.replace(/borderColor:\s*pin\.length === 6.*\n/g, '');


if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Cleaned inline react input styles in HomePage.jsx');
}
