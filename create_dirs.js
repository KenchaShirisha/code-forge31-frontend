const fs = require('fs');
const path = require('path');

const base = 'c:\\Users\\HP\\OneDrive\\Desktop\\codeforge';

const dirs = [
  'backend',
  'backend\\models',
  'backend\\routes',
  'backend\\middleware',
  'backend\\controllers',
  'backend\\data',
  'frontend\\src',
  'frontend\\src\\components',
  'frontend\\src\\pages',
  'frontend\\src\\context',
  'frontend\\src\\data',
  'frontend\\public',
];

dirs.forEach(dir => {
  const full = path.join(base, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log('Created:', full);
  } else {
    console.log('Exists:', full);
  }
});

console.log('\nAll directories ready!');
