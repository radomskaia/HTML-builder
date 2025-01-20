const fs = require('fs');
const path = require('path');
const readline = require('readline');

const writeStream = fs.createWriteStream(
  path.join(__dirname, 'project-dist', 'bundle.css'),
  { flags: 'a' },
);
const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
