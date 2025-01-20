const path = require('path');
const { readdir, copyFile, rm, mkdir } = require('fs/promises');
const fs = require('fs');

async function mergeStyles(dir, file, bundlerName) {
  const bundlePath = path.join(__dirname, 'project-dist', bundlerName);
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
        readStream.on('end', () => resolve());
        readStream.on('error', (err) => {
          reject(`The file ${file.name} has error`, err);
        });
      });
    });

    await Promise.all(readFilesPromises);
    writeStream.close();
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

async function copyAllFiles(parentDir, dirName, copyDirPath) {
  try {
    const files = await readdir(path.join(parentDir, dirName), {
      withFileTypes: true,
    });
    for (const file of files) {
      if (file.isDirectory()) {
        await rm(path.join(...copyDirPath, file.name), {
          recursive: true,
          force: true,
        });
        await mkdir(path.join(...copyDirPath, file.name), {
          recursive: true,
        });
        await copyAllFiles(file.parentPath, file.name, [
          ...copyDirPath,
          file.name,
        ]);
      } else {
        const dirPath = path.join(file.parentPath, file.name);
        const copyPath = path.join(...copyDirPath, file.name);
        await copyFile(dirPath, copyPath);
      }
    }
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

async function getComponents() {
  try {
    const files = await readdir(path.join(__dirname, 'components'), {
      withFileTypes: true,
    });

    const componentsObj = {};
    const readFilesPromises = files.map(async (file) => {
      const filePath = path.join(file.parentPath, file.name);
      if (path.extname(filePath) !== '.html') {
        return;
      }
      componentsObj[path.basename(filePath, '.html')] =
        await fs.promises.readFile(filePath, 'utf-8');
    });
    await Promise.all(readFilesPromises);
    return componentsObj;
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

async function htmlBuilder() {
  try {
    const projectDirPath = path.join(__dirname, 'project-dist');
    await rm(projectDirPath, { recursive: true, force: true });
    await mkdir(projectDirPath, { recursive: true });
    await copyAllFiles(__dirname, 'assets', [projectDirPath, 'assets']);
    await mergeStyles(__dirname, 'styles', 'style.css');
    const components = await getComponents();
    const template = await fs.promises.readFile(
      path.join(__dirname, 'template.html'),
      'utf-8',
    );
    const regexp = /{{(\w+)}}/g;
    const html = template.replaceAll(regexp, (_, key) => components[key]);
    await fs.promises.writeFile(path.join(projectDirPath, 'index.html'), html);
    console.log('HTML is built. Please open index.html');
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

htmlBuilder();
