import Dictionary from './Dictionary.js';
import Utils from './Utils';

/**
 * The class responsible for finding the replacement options
 * and organizing terms from the dictionary.
 */
class Replacer {
  /**
   * Instantiate the class with the given dictionary definition.
   *
   * @param {Object} dictionaryDefinition Object representing
   *  the dictionary definition.
   */
  constructor(dictionaryDefinition) {
    this.dictionary = new Dictionary(dictionaryDefinition.name, dictionaryDefinition.terms);
  }

  /**
   * Generate a regular expression string that contains
   * all relevant terms from the given key.
   *
   * @param {string} key Dictionary key for the list
   *  of terms
   * @return {string} Regular expression string
   */
  getRegExpForAllTerms(key) {
    return this.dictionary.getAllTerms(key)
      .map(v => {
        return `\\b${Utils.escapeRegExp(v)}\\b`;
      })
      .join('|');
  }

  /**
   * Get an object representing the data for a single
   * replacement for the given match.
   *
   * @param {string} match Match to be replaced
   * @param {string} keyFrom Dictionary key for the match
   * @param {string} keyTo Dictionary key for the replacement
   * @return {Object} Object representing the data for the replacement.
   *  The object contains the term and whether it is ambiguous:
   *  {
   *     term: {string}
   *     ambiguous: {boolean}
   *  }
   */
  getSingleReplacementData(match, keyFrom, keyTo) {
    return this.dictionary
      .getSingleOption(keyFrom, match, keyTo);
  }

  /**
   * Output the replacement text with the same approximate
   * character case of the original match.
   *
   * @param {string} originalMatch Original match that will
   *  be replaced and whose case we try to mimic.
   * @param {string} replacement Replacement text
   * @return {string} Replacement string with appropriate
   *  case
   */
  matchCase(originalMatch, replacement) {
    // Check whether the match is capitalized or all-caps
    // The test checks if the string is not the same at
    if (originalMatch.charAt(0) === originalMatch.charAt(0).toUpperCase()) {
      if (originalMatch === originalMatch.toUpperCase()) {
        // All-caps
        return replacement.toUpperCase();
      }

      if (originalMatch === Utils.capitalizeString(originalMatch)) {
        // Capitalize only first letter
        return Utils.capitalizeString(replacement);
      }
    }

    // No change
    return replacement.toLowerCase();
  }
}

export default Replacer;
