const fs = require('fs');
const path = require('path');

const lunr = require('lunr');
const removeMarkdown = require('remove-markdown');

const readmePath = path.resolve(__dirname, '..', 'README.md');

main();

function main() {
  console.log(JSON.stringify(generateIndex([
    fs.readFileSync(readmePath, {
      encoding: 'utf-8'
    })
  ]).toJSON()));
}

function generateIndex(files) {
  const index = lunr(function() {
    this.ref('id');
    this.field('title', {
      boost: 10 // Match title results before the rest
    });
    this.field('body');
  });

  files.forEach(function(file, i) {
    const lines = file.split('\n');

    index.add({
      id: i, // This should be something unique. Url slug for example.
      title: removeMarkdown(lines[0]),
      body: removeMarkdown(lines.slice(1).join('\n'))
    });
  });

  return index;
}
