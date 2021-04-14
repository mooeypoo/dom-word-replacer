import { expect } from 'chai';
import Dictionary from '../src/Dictionary';

describe('Dictionary test', () => {
  const definition = [
    {
      "category": "Terminology",
      "terms": {
        "men": ["patriarchy"],
        "women": ["matriarchy"]
      }
    },
    {
      "category": "Terminology (Adj)",
      "terms": {
        "men": ["patriarchal", "patriarchical"],
        "women": ["matriarchal", "matriarchical"]
      }
    },
    {
      "category": "Secondary terminology (Adj)",
      "terms": {
        "men": ["patrilineal"],
        "women": ["matrilineal"]
      }
    },
    {
      "category": "Pronouns: whose",
      "ambiguous": true,
      "terms": {
        "men": ["his"],
        "women": ["hers"]
      }
    },
    {
      "category": "Adverb",
      "terms": {
        "men": ["manly", "boyish"],
        "women": ["womanly", "girly"]
      }
    }
  ];
  const dict = new Dictionary('test dictionary', definition);

  describe('Dictionary metadata', () => {
    it('getName', () => {
      expect(dict.getName()).to.equal('test dictionary')
    });
  });

  describe('getAllTerms', () => {
    it('Get all terms for expected key', () => {
      expect(dict.getAllTerms('men')).to.deep.equal([
        'patriarchy',
        'patriarchal',
        'patriarchical',
        'patrilineal',
        'his',
        'manly',
        'boyish'
      ]);
    });

    it('Get all terms', () => {
      expect(dict.getAllTerms()).to.deep.equal([
        'patriarchy',
        'patriarchal',
        'patriarchical',
        'patrilineal',
        'his',
        'manly',
        'boyish',
        'matriarchy',
        'matriarchal',
        'matriarchical',
        'matrilineal',
        'hers',
        'womanly',
        'girly'
      ]);
    });

    it('Get empty array if requested key doesn\'t exist', () => {
      expect(dict.getAllTerms('foo')).to.deep.equal([]);
    });

  });

  describe('getOptions', () => {
    it('Retrieve existing key, full results', () => {
      expect(dict.getOptions('men', 'patriarchal'))
        .to.deep.equal({
          ambiguous: false,
          women: ['matriarchal','matriarchical']
        })
    });

    it('Retrieve nonexisting key', () => {
      expect(dict.getOptions('foo', 'patriarchal'))
        .to.be.undefined
    });

    it('Retrieve existing key, nonexisting term', () => {
      expect(dict.getOptions('men', 'foo'))
        .to.be.undefined
    });
  });

  describe('getSingleOption', () => {
    it('Retrieve existing key, specific target', () => {
      const result = dict.getSingleOption('men', 'patriarchal', 'women');
      expect(result.ambiguous).to.be.false;

      expect(['matriarchal', 'matriarchical'].indexOf(result.term) > -1)
        .to.be.true
    });
    it('Retrieve existing key, specific target, without result', () => {
      const result = dict.getSingleOption('men', 'foo', 'women');
      expect(result.ambiguous).to.be.false;

      expect(result.term)
        .to.be.undefined
    });
    it('Retrieve nonexisting key', () => {
      expect(dict.getSingleOption('foo', 'patriarchal', 'women'))
        .to.deep.equal({
          ambiguous: false,
          term: undefined
        })
    });
    it('Retrieve existing key, nonexisting target', () => {
      expect(dict.getSingleOption('men', 'patriarchal', 'foo'))
        .to.deep.equal({
          ambiguous: false,
          term: undefined
        })
    });
  });

  // describe('getTerms - lookup for all terms', () => {
  //   it('getTerms: Direct find single term as an array', () => {
  //     expect(dict.getTerms('sometitle')).to.deep.equal(['single_term'])
  //   });

  //   it('getTerms: Direct find hierarchy term as an array', () => {
  //     expect(dict.getTerms(['somehierarchy', 'deeperhierarchy', 'deeperdeeperhierarchy']))
  //       .to.deep.equal(['option one', 'option two'])
  //   });

  //   it('getTerms: Return empty if lookup does not exist', () => {
  //     expect(dict.getTerms(['foo', 'bar']))
  //       .to.deep.equal([])
  //   });

  //   it('getTerms: Return empty if lookup is not an array of strings', () => {
  //     expect(dict.getTerms(['somehierarchy']))
  //       .to.deep.equal([])
  //   });
  // })

  // describe('getOneTerm - lookup a single replacement value', () => {
  //   it('getOneTerm: return the expected term if the list included only one', () => {
  //     expect(dict.getOneTerm('sometitle'))
  //       .to.equal('single_term')
  //   })

  //   it('getOneTerm: return undefined for nonexisting requests', () => {
  //     expect(dict.getOneTerm(['foo', 'bar']))
  //       .to.equal(undefined)
  //   })

  //   it('getOneTerm: return undefined for requests that are not a string or array of strings', () => {
  //     expect(dict.getOneTerm(['somehierarchy', 'deeperhierarchy']))
  //       .to.equal(undefined)
  //   })

  //   it('getOneTerm: return a random single value if the group contains an array', () => {
  //     const result = dict.getOneTerm(['somearray'])
  //     expect(
  //       definition.somearray.indexOf(result) > -1
  //     ).to.be.true
  //   })
  // })

  // describe('getAllTerms - get all terms defined', () => {
  //   it('Get all terms', () => {
  //     expect(dict.getAllTerms()).to.deep.equal([
  //       'single_term',
  //       'array opt 1', 'array opt 2', 'array opt 3',
  //       'option one', 'option two'
  //     ])
  //   });
  // });
});
