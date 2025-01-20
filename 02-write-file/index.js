const fs = require('fs');
const path = require('path');
const readline = require('readline');

const writeStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));
const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function finishWrite() {
  console.log('Exiting, Goodbye');
  readLineInterface.close();
  process.exit();
}

console.log('Write your message here:');

readLineInterface.on('line', (line) => {
  if (line.trim().toLowerCase() === 'exit') {
    finishWrite();
  }
  writeStream.write(line + '\n');
});

writeStream.on('error', (err) => {
  console.log('Something went wrong', err);
});

readLineInterface.on('SIGINT', finishWrite);
