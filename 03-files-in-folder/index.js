const { readdir, stat } = require('fs/promises');
const path = require('path');

async function getFiles(dir, file) {
  try {
    const files = await readdir(path.join(dir, file), {
      withFileTypes: true,
    });

    for (const file of files) {
      if (file.isDirectory()) {
        continue;
      }
      const filePath = path.join(file.parentPath, file.name);
      const fileStat = await stat(filePath);
      const fileExtension = path.extname(filePath);
      const fileName = path.basename(filePath, fileExtension);
      console.log(`${fileName} - ${fileExtension} - ${fileStat.size}b`);
    }

  } catch (err) {
    console.log('Something went wrong', err);
  }
}

getFiles(__dirname, 'secret-folder');
