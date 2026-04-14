const fs = require('fs');
const acorn = require('acorn-jsx');
const Parser = require('acorn').Parser.extend(acorn());
try {
  Parser.parse(fs.readFileSync('client/src/pages/PlayerScreen.jsx', 'utf8'), {
    sourceType: 'module',
    ecmaVersion: 2020
  });
  console.log("Syntax is valid!");
} catch (err) {
  console.error("Syntax Error at line " + err.loc.line + ", col " + err.loc.column + ": " + err.message);
}
