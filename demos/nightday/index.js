const fs = require('fs');
const dictDefinition = require('./nightday.json');
const DomWordReplacer = require('../../index.js');

fs.readFile(__dirname + '/en.wikipedia.Night.html', 'utf8', function (err, html) {
  if (err) {
    console.log('Error reading file:', err);
    return;
  }
  console.time('replacer');
  const replacer = new DomWordReplacer(dictDefinition, {
    css: `
    .replaced-term {
      background-color: rgba(139, 195, 74, 0.5);
      padding: 0 0.2em;;
    }
    .replaced-term.ambiguous-term {
      background-color: rgba(255, 193, 7, 0.5);
    }
  `
  });
  let result = replacer.replace(html, 'night', 'day', 'https://en.wikipedia.org', true);
  console.timeEnd('replacer');
  console.log('Outputting content.');
  fs.writeFile('../output/replaced.en.wikipedia.Night.html', result, err => {
    // In case of a error throw err.
    if (err) {
      console.log('Could not write to file:', err);
      return;
    }
  });
});
