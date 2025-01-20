const path = require('path');
const { readdir, copyFile, rm, mkdir } = require('fs/promises');

async function copyFiles() {
  try {
    const copyDirPath = path.join(__dirname, 'files-copy');
    const dirPath = path.join(__dirname, 'files');
    await rm(copyDirPath, { recursive: true, force: true });
    await mkdir(copyDirPath, { recursive: true });
    const files = await readdir(dirPath, {
      withFileTypes: true,
    });
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      const copyPath = path.join(copyDirPath, file.name);
      await copyFile(filePath, copyPath);
    }
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

copyFiles();
