const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../node_modules/@imgly/background-removal-data/dist');
const destDir = path.join(__dirname, '../public/models');

if (!fs.existsSync(srcDir)) {
  console.log('Imgly data source not found, skipping copy.');
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  // Only copy files, skip directories if any
  if (fs.lstatSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, destFile);
  }
});

console.log(`Copied ${files.length} AI model files to public/models`);
