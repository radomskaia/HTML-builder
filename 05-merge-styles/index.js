const fs = require('fs');
const path = require('path');
const { readdir, rm } = require('fs/promises');

async function getFiles(dir, file) {
  const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
  await rm(bundlePath, { recursive: true, force: true });
  const writeStream = fs.createWriteStream(bundlePath, { flags: 'a' });
  try {
    const files = await readdir(path.join(dir, file), {
      withFileTypes: true,
    });

    const readFilesPromises = files.map(async (file) => {
      const filePath = path.join(file.parentPath, file.name);
      if (!file.isFile() || path.extname(filePath) !== '.css') {
        return;
      }
      return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
        readStream.on('data', (line) => {
          writeStream.write(line + '\n');
        });
        readStream.on('end', () => {
          console.log(`The file ${file.name} has been read`);
          resolve();
        });
        readStream.on('error', (err) => {
          reject(`The file ${file.name} has error`, err);
        });
      });
    });

    await Promise.all(readFilesPromises);
    writeStream.end(() => {
      console.log('The script is finished');
      process.exit();
    });
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

getFiles(__dirname, 'styles');
