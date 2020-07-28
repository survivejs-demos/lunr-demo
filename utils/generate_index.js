const fs = require('fs');
const path = require('path');

const lunr = require('lunr');
const removeMarkdown = require('remove-markdown');

main();

function main() {
  const readmePath = path.resolve(__dirname, '..', 'README.md');

  console.log(JSON.stringify(generateIndex(
    fs.readFileSync(readmePath, {
      encoding: 'utf-8'
    })
  )));
}

function generateIndex(file) {
  // Skip index and empty lines.
  const lines = file.split('\n').slice(1).filter(id).map(removeMarkdown);
  const index = lunr(function() {
    this.ref('id');
    this.field('line');

    lines.forEach((line, i) => {
      this.add({
        id: i, // Line number
        line: line
      });
    });
  });

  return {
    lines: lines,
    index: index
  };
}

function id(a) {return a;};
