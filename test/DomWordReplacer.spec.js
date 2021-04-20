import { expect } from 'chai';
import DomWordReplacer from '../src/DomWordReplacer.js';

const wrapHtmlResult = str => {
  return `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${str}</body></html>`
};

describe('DomWordReplacer test', () => {
  const definition = {
    "name": "Test dictionary",
    "terms": [
      {
        "category": "Terminology",
        "terms": {
          "dict1": ["terminology"],
          "dict2": ["reverseterminology"]
        }
      },
      {
        "category": "Terminology (Adj)",
        "ambiguous": "dict1",
        "terms": {
          "dict1": ["adjective"],
          "dict2": ["reverseadjective"]
        }
      }
    ]
  };
  const replacer = new DomWordReplacer(definition, {
    termClass: 'customClass',
    ambiguousClass: 'customAmbiguousClass'
  });

  it('Replaces html fully', () => {
    expect(replacer.replace(
      '<p>terminology to replace and ambiguous adjective</p>',
      'dict1',
      'dict2'
    )).to.equal(
      wrapHtmlResult(
        '<p><span class="customClass" title="terminology">reverseterminology</span>' +
        ' to replace and ambiguous <span class="customClass customAmbiguousClass" title="adjective">reverseadjective</span></p>'
      )
    )
  });
});