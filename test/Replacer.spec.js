import { expect } from 'chai';
import Replacer from '../src/Replacer.js';

describe('Replacer test', () => {
  const dictionaryDefinition = {
    name: 'Test dictionary',
    terms: [
      {
        'category': 'Terminology',
        'terms': {
          'dict1': ['dict1term1'],
          'dict2': ['dict2term1']
        }
      },
      {
        'category': 'Terminology (Adj)',
        'terms': {
          'dict1': ['dict1term2a', 'dict1term2b'],
          'dict2': ['dict2term2a', 'dict2term2b']
        }
      },
      {
        'category': 'Secondary terminology (Adj)',
        'terms': {
          'dict1': ['dict1term3'],
          'dict2': ['dict2term3']
        }
      },
      {
        'category': 'Pronouns: whose',
        'ambiguous': true,
        'terms': {
          'dict1': ['dict1term4'],
          'dict2': ['dict2term4']
        }
      },
      {
        'category': 'Adverb',
        'terms': {
          'dict1': ['dict1term5a', 'dict1term5b'],
          'dict2': ['wodict1term5a', 'dict2term5b']
        }
      }
    ]
  };

  describe('getRegExpForAllTerms', () => {
    it('Gets all terms for the given key', () => {
      const replacer = new Replacer(dictionaryDefinition);
      expect(replacer.getRegExpForAllTerms('dict1'))
        .to.equal(
          '\\bdict1term1\\b|\\bdict1term2a\\b|\\bdict1term2b\\b|' +
          '\\bdict1term3\\b|\\bdict1term4\\b|\\bdict1term5a\\b|' +
          '\\bdict1term5b\\b'
        )
    });
  });

  describe('matchCase', () => {
    const cases = [
      {
        msg: 'All lowercase, retains case',
        match: 'foo',
        replacement: 'grault',
        expected: 'grault'
      },
      {
        msg: 'All lowercase, forces lowercase',
        match: 'foo',
        replacement: 'GRAULT',
        expected: 'grault'
      },
      {
        msg: 'First letter capitalized',
        match: 'Foo',
        replacement: 'GRAULT',
        expected: 'Grault'
      },
      {
        msg: 'Entire string capital letters',
        match: 'FOO',
        replacement: 'grault',
        expected: 'GRAULT'
      },
      {
        msg: 'Mixed case, force lowercase',
        match: 'FOoOoO',
        replacement: 'Grault',
        expected: 'grault'
      }

    ];

    cases.forEach(testCase => {
      const replacer = new Replacer(dictionaryDefinition);
      it(testCase.msg, () => {
        expect(replacer.matchCase(testCase.match, testCase.replacement))
          .to.equal(testCase.expected);
      });
    });
  });

});
