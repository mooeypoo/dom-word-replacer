import { expect } from 'chai';
import Dictionary from '../src/Dictionary.js';

describe('Dictionary test', () => {
  const definition = [
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
  ];
  const dict = new Dictionary('test dictionary', definition);

  describe('Dictionary metadata', () => {
    it('getName', () => {
      expect(dict.getName()).to.equal('test dictionary')
    });

    it('getTermMap', () => {
      expect(dict.getTermMap()).to.deep.equal({
        'dict1': {
          'dict1term1': {
            'ambiguous': false,
            'dict2': [
              'dict2term1'
            ]
          },
          'dict1term2a': {
            'ambiguous': false,
            'dict2': [
              'dict2term2a',
              'dict2term2b'
            ]
          },
          'dict1term2b': {
            'ambiguous': false,
            'dict2': [
              'dict2term2a',
              'dict2term2b'
            ]
          },
          'dict1term3': {
            'ambiguous': false,
            'dict2': [
              'dict2term3'
            ]
          },
          'dict1term4': {
            'ambiguous': false,
            'dict2': [
              'dict2term4'
            ]
          },
          'dict1term5a': {
            'ambiguous': false,
            'dict2': [
              'wodict1term5a',
              'dict2term5b'
            ]
          },
          'dict1term5b': {
            'ambiguous': false,
            'dict2': [
              'wodict1term5a',
              'dict2term5b'
            ]
          },
        },
        'dict2': {
          'dict2term1': {
            'ambiguous': false,
            'dict1': [
              'dict1term1'
            ]
          },
          'dict2term2a': {
            'ambiguous': false,
            'dict1': [
              'dict1term2a',
              'dict1term2b'
            ]
          },
          'dict2term2b': {
            'ambiguous': false,
            'dict1': [
              'dict1term2a',
              'dict1term2b'
            ]
          },
          'dict2term3': {
            'ambiguous': false,
            'dict1': [
              'dict1term3'
            ]
          },
          'dict2term4': {
            'ambiguous': false,
            'dict1': [
              'dict1term4'
            ]
          },
          'dict2term5b': {
            'ambiguous': false,
            'dict1': [
              'dict1term5a',
              'dict1term5b'
            ]
          },
          'wodict1term5a': {
            'ambiguous': false,
            'dict1': [
              'dict1term5a',
              'dict1term5b'
            ]
          }
        }
      })
    });
  });

  describe('getAllTerms', () => {
    it('Get all terms for expected key', () => {
      expect(dict.getAllTerms('dict1')).to.deep.equal([
        'dict1term1',
        'dict1term2a',
        'dict1term2b',
        'dict1term3',
        'dict1term4',
        'dict1term5a',
        'dict1term5b'
      ]);
    });

    it('Get all terms', () => {
      expect(dict.getAllTerms()).to.deep.equal([
        'dict1term1',
        'dict1term2a',
        'dict1term2b',
        'dict1term3',
        'dict1term4',
        'dict1term5a',
        'dict1term5b',
        'dict2term1',
        'dict2term2a',
        'dict2term2b',
        'dict2term3',
        'dict2term4',
        'wodict1term5a',
        'dict2term5b'
      ]);
    });

    it('Get empty array if requested key doesn\'t exist', () => {
      expect(dict.getAllTerms('foo')).to.deep.equal([]);
    });

  });

  describe('getOptions', () => {
    it('Retrieve existing key, full results', () => {
      expect(dict.getOptions('dict1', 'dict1term2a'))
        .to.deep.equal({
          ambiguous: false,
          dict2: ['dict2term2a','dict2term2b']
        })
    });

    it('Retrieve nonexisting key', () => {
      expect(dict.getOptions('foo', 'dict1term2a'))
        .to.be.undefined
    });

    it('Retrieve existing key, nonexisting term', () => {
      expect(dict.getOptions('dict1', 'foo'))
        .to.be.undefined
    });
  });

  describe('getSingleOption', () => {
    it('Retrieve existing key, specific target', () => {
      const result = dict.getSingleOption('dict1', 'dict1term2a', 'dict2');
      expect(result.ambiguous).to.be.false;
      expect(['dict2term2a', 'dict2term2b'].indexOf(result.term) > -1)
        .to.be.true
    });
    it('Retrieve existing key, specific target, without result', () => {
      const result = dict.getSingleOption('dict1', 'foo', 'dict2');
      expect(result.ambiguous).to.be.false;

      expect(result.term)
        .to.be.undefined
    });
    it('Retrieve nonexisting key', () => {
      expect(dict.getSingleOption('foo', 'dict1term2a', 'dict2'))
        .to.deep.equal({
          ambiguous: false,
          term: undefined
        })
    });
    it('Retrieve existing key, nonexisting target', () => {
      expect(dict.getSingleOption('dict1', 'dict1term2a', 'foo'))
        .to.deep.equal({
          ambiguous: false,
          term: undefined
        })
    });
  });
});
