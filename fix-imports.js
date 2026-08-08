const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
}

const files = walkSync('./src').filter(f => f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/')) {
    const dir = path.dirname(file);
    const relativePathToSrc = path.relative(dir, './src').replace(/\\/g, '/');
    const importPrefix = relativePathToSrc === '' ? './' : relativePathToSrc + '/';
    
    content = content.replace(/@\//g, importPrefix);
    fs.writeFileSync(file, content, 'utf8');
  }
});

// Also fix in api folder
const apiFiles = walkSync('./api').filter(f => f.endsWith('.ts'));
apiFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/')) {
    const dir = path.dirname(file);
    const relativePathToSrc = path.relative(dir, './src').replace(/\\/g, '/');
    const importPrefix = relativePathToSrc === '' ? './' : relativePathToSrc + '/';
    
    content = content.replace(/@\//g, importPrefix);
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Fixed all @/ imports to relative paths!');
