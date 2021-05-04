import { expect } from 'chai';
import DomManager from '../src/DomManager.js';
import Dictionary from '../src/Dictionary.js';
import serialize from 'w3c-xmlserializer';

const wrapHtmlResult = str => {
  return `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${str}</body></html>`
};
const dictDefinition = {
  name: 'Test dictionary',
  terms: [
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
  ]
};

describe('DomManager test', () => {
  describe('HTML replacements', () => {
    const manager = new DomManager(dictDefinition);
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
        msg: 'Case insensitive replacements; keep case (capitalized)',
        input: '<p>Text with Term1</p>',
        expected: '<p>Text with <span class="replaced-term" title="Term1">Flippedterm1</span></p>'
      },
      {
        msg: 'Case insensitive replacements; keep case (all caps)',
        input: '<p>Text with TERM1</p>',
        expected: '<p>Text with <span class="replaced-term" title="TERM1">FLIPPEDTERM1</span></p>'
      },
      {
        msg: 'Case insensitive replacements; mixed case = all lowercase',
        input: '<p>Text with TErM1</p>',
        expected: '<p>Text with <span class="replaced-term" title="TErM1">flippedterm1</span></p>'
      },
      {
        msg: 'Replacement is first word in title',
        input: '<h1>Term1 (replacement)</h1>',
        expected: '<h1><span class="replaced-term" title="Term1">Flippedterm1</span> (replacement)</h1>'
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
        input: '<div><p class="replaced-term">Text with term1</p> <p>and term3</p></div>',
        expected: '<div><p class="replaced-term">Text with term1</p> <p>and <span class="replaced-term" title="term3">flippedterm3</span></p></div>'
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
      const result = manager.replace(t.input, 'dict1','dict2', { replaceBothWays: !!t.both });
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

  describe('HTML suggestion mode', () => {
    const manager = new DomManager(dictDefinition, { suggestionMode: true });
    const testCases = [
      {
        msg: 'Suggested replacement with one option',
        input: '<h1>Term1!</h1>',
        expected: '<h1><span class="replaced-term" data-replacement-options="[\'flippedterm1\']">Term1</span>!</h1>'
      },
      {
        msg: 'Suggested replacement with multiple options',
        input: '<h1>Term2!</h1>',
        expected: '<h1><span class="replaced-term" data-replacement-options="[\'flippedterm2opt1\',\'flippedterm2opt2\']">Term2</span>!</h1>'
      },
      {
        msg: 'Suggested replacement with multiple options, ambiguous',
        input: '<h1>Term4amb!</h1>',
        expected: '<h1><span class="replaced-term ambiguous-term" data-replacement-options="[\'flippedterm4ambopt1\',\'flippedterm4ambopt2\']">Term4amb</span>!</h1>'
      }
    ];

    testCases.forEach(t => {
      const result = manager.replace(t.input, 'dict1','dict2', { replaceBothWays: !!t.both });
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
    const manager = new DomManager(dictDefinition);
    
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

    it('Does not strip full <script> tags if stripScriptTags is false', () => {
      const noStripManager = new DomManager(dictDefinition, { stripScriptTags: false });
      const htmlString = `<script type="text/javascript">$.ready();</script><p>Do not strip this</p>`;
      const doc = noStripManager.getDocumentFromHtml(htmlString);
      noStripManager.sanitize(doc);
      expect(
          serialize(doc).indexOf('<script type="text/javascript">$.ready();</script>') > -1
        ).to.be.true;
    });
  });

  describe('addBaseUrl', () => {
    const dict = new Dictionary('test dictionary', []);
    const manager = new DomManager(dictDefinition);

    it('Adds a <base> tag where none existed', () => {
      const doc = manager.getDocumentFromHtml('<p>test</p>');
      manager.addBaseUrl(doc, 'http://example.com');
      expect(serialize(doc)).to.equal('<html xmlns="http://www.w3.org/1999/xhtml"><head><base href="http://example.com" target="_blank" /></head><body><p>test</p></body></html>');
    });

    it.skip('Adds a <base> tag on top of of an existing one', () => {
      const str = '<html xmlns="http://www.w3.org/1999/xhtml"><head><base href="http://example.com" target="_blank" /></head><body><p>test</p></body></html>';
      const doc = manager.getDocumentFromHtml('<html xmlns="http://www.w3.org/1999/xhtml"><head><base href="http://foobar.com" target="_blank" /></head><body><p>test</p></body></html>');
      manager.addBaseUrl(doc, 'http://example.com');

      expect(serialize(doc)).to.equal('<html xmlns="http://www.w3.org/1999/xhtml"><head><base href="http://example.com" target="_blank" /><base href="http://foobar.com" target="_blank" /></head><body><p>test</p></body></html>');
    });
  });

  describe('showOriginalTerm', () => {
    const manager = new DomManager(dictDefinition, { showOriginalTerm: false });

    it('Respects showOriginalTerm=false', () => {
      const htmlString = '<p>Replace term1 with something</p>';
      expect(manager.replace(htmlString, 'dict1', 'dict2')).to.equal(
        wrapHtmlResult('<p>Replace <span class="replaced-term">flippedterm1</span> with something</p>')
      );
    });
  });

  describe('showDictionaryKeys', () => {
    const manager = new DomManager(dictDefinition, { showDictionaryKeys: true });

    it('Respects showDictionaryKeys=false', () => {
      const htmlString = '<p>Replace term1 with something</p>';
      expect(manager.replace(htmlString, 'dict1', 'dict2')).to.equal(
        wrapHtmlResult('<p>Replace <span class="replaced-term" title="term1" data-replaced-from="dict1" data-replaced-to="dict2">flippedterm1</span> with something</p>')
      );
    });
  });

  describe('keepSameCase', () => {
    it('Respects keepSameCase=true', () => {
      const manager = new DomManager(dictDefinition, { keepSameCase: true });
      const htmlString = '<p>Replace Term1 and TERM3</p>';
      expect(manager.replace(htmlString, 'dict1', 'dict2')).to.equal(
        wrapHtmlResult('<p>Replace <span class="replaced-term" title="Term1">Flippedterm1</span> and <span class="replaced-term" title="TERM3">FLIPPEDTERM3</span></p>')
      );
    });

    it('Respects keepSameCase=false', () => {
      const manager = new DomManager(dictDefinition, { keepSameCase: false });
      const htmlString = '<p>Replace Term1 and TERM3</p>';
      expect(manager.replace(htmlString, 'dict1', 'dict2')).to.equal(
        wrapHtmlResult('<p>Replace <span class="replaced-term" title="Term1">flippedterm1</span> and <span class="replaced-term" title="TERM3">flippedterm3</span></p>')
      );
    });
  });

  describe('Inject CSS', () => {
    const manager = new DomManager(dictDefinition, { css: '.test { color: red; }' });

    it('Inject CSS', () => {
      const htmlString = '<p>some html</p>';
      expect(manager.replace(htmlString, 'dict1', 'dict2')).to.equal(
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><style>.test { color: red; }</style></head><body><p>some html</p></body></html>'
      );
    });
  });
});