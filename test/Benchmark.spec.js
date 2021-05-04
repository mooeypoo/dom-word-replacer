import { expect } from 'chai';
import fs from 'fs';
import DomWordReplacer from '../src/DomWordReplacer.js';
const { PerformanceObserver, performance } = require('perf_hooks');
const dictionaryDefinition = require(`${__dirname}/benchmark/dictionary.json`);

describe('Benchmark test', () => {
  // Long articles found on https://en.wikipedia.org/wiki/Special:LongPages
  const files = [
    // Large amount of citations
    'wikipedia.Biden',
    'wikipedia.Obama',
    // Large articles
    'wikipedia.List_of_dramatic_television_series_with_LGBT_characters'
  ];

  files.forEach(fileName => {
    it(`Benchmark, large article: ${fileName}`, done => {
      fs.readFile(`${__dirname}/benchmark/${fileName}.html`, 'utf8', (err, html) => {
        if (err) {
          done(err);
        }
        const startTime = performance.now();
        const replacer = new DomWordReplacer(dictionaryDefinition);
        let result = replacer.replace(html, 'men', 'women', { baseUrl: 'https://en.wikipedia.org', replaceBothWays: true });
        const endTime = performance.now();
        expect(endTime - startTime).to.be.at.most(1000);
        done();
      });
    });
  });
  
});
