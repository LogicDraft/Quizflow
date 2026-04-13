const fs = require('fs');
const files = fs.readdirSync('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/public/avatars').filter(f => !f.endsWith('.txt'));
const arr = files.map(f => `"\/avatars\/${f}"`);
fs.writeFileSync('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/avatars_list.txt', `const AVATARS = [\n  ${arr.join(',\n  ')}\n];\n`);
