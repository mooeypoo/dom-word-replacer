![Java CI with Maven](https://github.com/mooeypoo/dom-word-replacer/workflows/Node.js%20CI/badge.svg) ![GitHub last commit](https://img.shields.io/github/last-commit/mooeypoo/dom-word-replacer) [![Maintainability](https://api.codeclimate.com/v1/badges/81b1c5c9f6fde4d37bff/maintainability)](https://codeclimate.com/github/mooeypoo/dom-word-replacer/maintainability) [![Coverage Status](https://coveralls.io/repos/github/mooeypoo/dom-word-replacer/badge.svg?branch=main)](https://coveralls.io/github/mooeypoo/dom-word-replacer?branch=main) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md) [![Donate to the project!](https://img.shields.io/badge/Buy%20me%20a%20coffee!-Donate-ff69b4?style=flat)](https://ko-fi.com/mooeypoo)

# DOM word replacer

A package used to perform word replacements in HTML documents.

# Installation

To use this package, install it in your project:

```
npm install --save @mooeypoo/dom-word-replacer
```

1. Instantiate the `DomWordReplacer(dictionaryDefinition, configOptions)` object with a replacement dictionary and your desired configuration. See below for configuration options.
2. Call `DomWordReplacer.replace` with your HTML, desired dictionary keys, and optional base-url to get a replaced HTML.

```
const rep = new DomWordReplacer(dictionaryDefinition);
const result = rep.replace(htmlString, 'dict1', 'dict2', { baseUrl: 'http://sample.com', replaceBothWays: false});
```

# Dictionary definition

The package finds terms and replaces them with other given terms, based on given dictionaries. Dictionaries define what replacements will be available in either direction. They are expected to be in json format, and require a specific structure.

## Basic structure

A basic dictionary must have a name, and a defined array of term objects. Example:

```json
{
  "name": "Test dictionary",
  "terms": []
}
```

Terms are defining the replacements, and can include more than one language, set, or key replacements. The required data is `terms` that includes each key and its terms, but an optional key `category` can be added for clarity or separation of the terms in the dictionary. This string is only used for display if the dictionary is outputted as a table, and does not impact behavior.

Each group/category defines exchangeable terms between the given dictionaries. If words have synonyms, they can be added together, and a random one will be picked as a replacement, but both will be used for finding terms to be replaced.

### Example dictionary

```json
{
  "name": "Test dictionary",
  "terms": [
    {
      "category": "Base terms",
      "terms": {
        "dict1": ["word1", "word2"],
        "dict2": ["replacement"],
        "dict3": ["alternateword"]
      }
    },
    {
      "category": "Enhanced terms",
      "terms": {
        "dict1": ["terminology"],
        "dict2": ["alternativeterm1", "alternativeterm2"],
        "dict3": ["anotherterm"]
      }
    }
  ]
}
```
The above definition will be used to find replacements and perform replacements, depending on the requested keys.

For example, calling:

```js
const replacer = new DomWordReplacer(dictionaryDefinition);
replacer.replace(htmlString, 'dict1', 'dict2');
```

The above will replace any words that originate in `dict1` (`word1`, `word2`, `terminology`) with the defined replacements in each group for `dict2`. 

* Any instance of `word1` will be replaced with `replacement`
* Any instance of `word2` will be replaced with `replacement`
* Any instance of `terminology` will be replaced with one of either `alternativeterm1` or `alternativeterm2`, randomly.

### Ambiguous terms

When 'translating' and replacing one word for another, there may be cases where terms are ambiguous. One example from the English language is switching gendered term "his"; this word can either be replaced with "hers" or with "her" ('his wallet' -> 'her wallet', but also 'the wallet is his' -> 'the wallet is hers'). 

...This is also why most translation software does not use pure 1:1 replacement terms.

However, in case such terms exist, there tool allows you to mark them with another CSS class so you can style them differently. To mark a group of term/replacements as ambiguous, add `ambiguous: [...keys]` to the group, where the keys are the keys for the translation direction of the ambiguity. 

Example:

```
"terms": [
  {
    "category": "Posessive",
    "ambiguous": ["m"],
    "terms": {
      "m": ["his"],
      "f": ["her"],
      "n": ["their"]
    }
  },
  {
    "category": "Posessive2",
    "ambiguous": "m",
    "terms": {
      "m": ["his"],
      "f": ["hers"],
      "n": ["theirs"]
    }
  }
]
```

In the case of his/hers/her, the term is only ambiguous if the translation is from `his` to any other; it is not ambiguous from `her` or `hers`. This means the ambiguous definition should reflect the one-way ambiguity: `ambiguous: ['m']`. You can add any other key that contains an ambiguity to the array, or use a string if there's only one key that exposes ambiguity.


## Configuration options

There are several configuration options available for the replacer.

### CSS Classes

The replacer wraps each replacement with a `<span>` that has an associated class to it. The default class is `replaced-term`. This class name can be changed using the config property `termClass`.

If terms are defined as ambiguous in the dictionary definition, another class is attached to the wrapper span. By default, that class is `ambiguous-term`. This class name can be changed using the config property `ambiguousClass`.

### Inject CSS

You can make sure there's some css injected into the document to style the `replaced-term` and `ambiguous-term` classes, by passing a string to the `css` config option. If the string exists,
it will be injected (after replacement) into the new document, in a `<style>` tag.

### Showing original term

By default, the wrapper span of every replacement will include the original word that was replaced in the `title` property. To disable that feature, set `showOriginalTerm` to false.

### Keep capitalization and case

By default, the system will attempt to mimic the same case of the matched word in two cases:
- Capitalized replacement ('Foo' -> 'Bar')
- All-caps replacements ('FOO' -> 'BAR')

All other cases will produce a replacement in all-lower case.

To avoid automatically capitalizing, you can set the config option `keepSameCase` to false.

### Configuration example

```js
{
  showOriginalTerm: false,
  termClass: 'css-class-for-replaced-terms',
  ambiguousClass: 'css-class-for-ambiguous-terms'
}
```

# Credits

* Made with :coffee: by Moriel Schottlender ([@mooeypoo](https://twitter.com/mooeypoo))
* Bundling and docs based on [Babel Starter Kit](https://github.com/kriasoft/babel-starter-kit)
