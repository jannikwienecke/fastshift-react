const fs = require('fs');
const path = require('path');

function fixImports(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.d.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(
        /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/libs\/core\/src\/index\.ts['"];/g,
        "from '@apps-next/core';"
      );
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

fixImports(path.join(__dirname, '../dist/libs/prisma-adapter'));
