const fs = require('fs');

const list = fs.readFileSync('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/avatars_list.txt', 'utf8');
const file = 'c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src/components/AvatarPicker.jsx';

let content = fs.readFileSync(file, 'utf8');

// Replace AVATARS array
content = content.replace(/const AVATARS = \[[\s\S]*?\];/, list);

// Make grid scrollable
content = content.replace(
  /gridTemplateColumns: "repeat\(8, 1fr\)",\s*gap: 6,/,
  'gridTemplateColumns: "repeat(5, 1fr)",\n        gap: 8,\n        maxHeight: "38vh",\n        overflowY: "auto",\n        paddingRight: "8px",\n        paddingBottom: "8px",'
);

fs.writeFileSync(file, content);
console.log("Updated AvatarPicker.jsx");
