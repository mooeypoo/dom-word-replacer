const fs = require('fs');
const DomWordReplacer = require('../dist');

class DemoRunner {
  constructor(name, directory, keys, replacerOptions) {
    this.name = name;
    this.keys = keys;
    this.replacerOptions = replacerOptions || {};
    this.directory = directory;
    this.dictDefinition = require(`${__dirname}/${directory}/dictionary.json`);
  }

  run() {
    fs.readFile(`${__dirname}/${this.directory}/input.html`, 'utf8', (err, html) => {
      if (err) {
        console.log(`Error reading file for "${this.name}":`, err);
        return;
      }
      console.time('Replacer ' + this.name);
      const replacer = new DomWordReplacer(this.dictDefinition, this.replacerOptions.config);
      let result = replacer.replace(html, this.keys[0], this.keys[1], { baseUrl: this.replacerOptions.baseUrl, replaceBothWays: true });
      console.timeEnd('Replacer ' + this.name);

      fs.writeFile(`${__dirname}/output/Replaced - ${this.name}.html`, result, err => {
        // In case of a error throw err.
        if (err) {
          console.log(`Could not write to file for "${this.name}":`, err);
          return;
        }
      });
    });
  }
}

module.exports = DemoRunner;