import { expect } from 'chai';
import DomManager from '../src/DomManager.js';
import Dictionary from '../src/Dictionary.js';
import serialize from 'w3c-xmlserializer';

const wrapHtmlResult = str => {
  return `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${str}</body></html>`
};

describe('DomManager test', () => {
  describe('HTML replacements', () => {
    const definition = [
      {
        "category": "Category 1",
        "terms": {
          "dict1": ["term1"],
          "dict2": ["flippedterm1"]
        }
      },
      {
        "category": "Category 2",
        "terms": {
          "dict1": ["term2"],
          "dict2": ["flippedterm2opt1", "flippedterm2opt2"]
        }
      },
      {
        "category": "Category 3",
        "terms": {
          "dict1": ["term3"],
          "dict2": ["flippedterm3"]
        }
      },
      {
        "category": "Category 4",
        "ambiguous": "dict1",
        "terms": {
          "dict1": ["term4amb"],
          "dict2": ["flippedterm4ambopt1", "flippedterm4ambopt2"]
        }
      }
    ];
    const dict = new Dictionary('test dictionary', definition);
    const manager = new DomManager(dict);
    const testCases = [
      {
        msg: 'Single replacement in h1 tag',
        input: '<h1>Title with term1!</h1>',
        expected: '<h1>Title with <span class="replaced-term" title="term1">flippedterm1</span>!</h1>'
      },
      {
        msg: 'Multiple replacements in the same tag',
        input: '<p>Text with term1 and term3 together</p>',
        expected: '<p>Text with <span class="replaced-term" title="term1">flippedterm1</span> and <span class="replaced-term" title="term3">flippedterm3</span> together</p>'
      },
      {
        msg: 'Multiple replacements in hierarchical tags',
        input: '<div>Text with term1 <p>and term3</p> inside</div>',
        expected: '<div>Text with <span class="replaced-term" title="term1">flippedterm1</span> <p>and <span class="replaced-term" title="term3">flippedterm3</span></p> inside</div>',
      },
      {
        msg: 'Ambiguous replacement with multiple replacement options',
        input: '<p>This term term4amb is ambiguous</p>',
        expected: [
          '<p>This term <span class="replaced-term ambiguous-term" title="term4amb">flippedterm4ambopt1</span> is ambiguous</p>',
          '<p>This term <span class="replaced-term ambiguous-term" title="term4amb">flippedterm4ambopt2</span> is ambiguous</p>'
        ]
      },
      {
        msg: 'Multiple matches, with already-existing replacement class',
        input: '<div><span class="replaced-term">Text with term1</span> <p>and term3</p></div>',
        expected: '<div><span class="replaced-term">Text with term1</span> <p>and <span class="replaced-term" title="term3">flippedterm3</span></p></div>'
      },
      {
        msg: 'Skipping replacements inside tag properties',
        input: '<div>The term1 is replaced but <img title="this term3 should not be replaced" /> and this term3 is replaced.</div>',
        expected: '<div>The <span class="replaced-term" title="term1">flippedterm1</span> is replaced but <img title="this term3 should not be replaced" /> and this <span class="replaced-term" title="term3">flippedterm3</span> is replaced.</div>',
      },
      {
        msg: 'Replacing single words inside h1 and h2 elements',
        input: '<h1>term1</h1> and also <h2>term3</h2>',
        expected: '<h1><span class="replaced-term" title="term1">flippedterm1</span></h1> and also <h2><span class="replaced-term" title="term3">flippedterm3</span></h2>'
      },
      {
        both: true,
        msg: 'Replacing both ways',
        input: '<p>Replacing term1 but also flippedterm3</p>',
        expected: '<p>Replacing <span class="replaced-term" title="term1">flippedterm1</span> but also <span class="replaced-term" title="flippedterm3">term3</span></p>'
      }

    ];
    testCases.forEach(t => {
      const result = manager.replace(t.input, 'dict1','dict2', '', !!t.both);
      it(t.msg, () => {
        if (Array.isArray(t.expected)) {
          // In this case, we may have two options, so check if at least one (but no others) is correct
          const equalsToAtLeastOne = result === wrapHtmlResult(t.expected[0]) || result === wrapHtmlResult(t.expected[1]);
          expect(equalsToAtLeastOne).to.be.true;
        } else {
          expect(result).to.be.equal(wrapHtmlResult(t.expected));
        }
      });
    });
  });

  describe('sanitize', () => {
    const dict = new Dictionary('test dictionary', []);
    const manager = new DomManager(dict);
    
    it('Strips full <script> tags', () => {
      const htmlString = `<script type="text/javascript">$.ready();</script><p>Do not strip this</p>`;
      const doc = manager.getDocumentFromHtml(htmlString);
      manager.sanitize(doc);
      expect(serialize(doc)).to.equal(wrapHtmlResult('<p>Do not strip this</p>'));
    });

    it('Strips linked <script> tags', () => {
      const htmlString = `<script src="http://fake.link/script.js"></script><p>Do not strip this</p>`;
      const doc = manager.getDocumentFromHtml(htmlString);
      manager.sanitize(doc);
      expect(serialize(doc)).to.equal(wrapHtmlResult('<p>Do not strip this</p>'));
    });
  });

  describe('addBaseUrl', () => {
    const dict = new Dictionary('test dictionary', []);
    const manager = new DomManager(dict);

    it('Adds a <base> tag where none existed', () => {
      const doc = manager.getDocumentFromHtml('<p>test</p>');
      manager.addBaseUrl(doc, 'http://example.com');
      expect(serialize(doc)).to.equal('<html xmlns="http://www.w3.org/1999/xhtml"><head><base xmlns="http //www.w3.org/1999/xhtml" href="http://example.com" target="_blank"/></head><body><p>test</p></body></html>');
    });

    it.skip('Adds a <base> tag instead of an existing one', () => {
      const str = '<html xmlns="http://www.w3.org/1999/xhtml"><head><base xmlns="http //www.w3.org/1999/xhtml" href="http://example.com" target="_blank"/></head><body><p>test</p></body></html>';
      const doc = manager.getDocumentFromHtml('<html xmlns="http://www.w3.org/1999/xhtml"><head><base xmlns="http //www.w3.org/1999/xhtml" href="http://foobar.com" target="_blank"/></head><body><p>test</p></body></html>');
      manager.addBaseUrl(doc, 'http://example.com');

      expect(serialize(doc)).to.equal('<html xmlns="http://www.w3.org/1999/xhtml"><head><base xmlns="http //www.w3.org/1999/xhtml" href="http://example.com" target="_blank"/></head><body><p>test</p></body></html>');
    });
  });
});