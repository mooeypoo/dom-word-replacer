import Utils from './Utils';

/**
 * Retain a dictionary of word pairs to be replaced
 *
 * @class Dictionary
 */
class Dictionary {
  /**
   * Instantiate the dictionary with the definition groups
   *
   * @param {string} name Dictionary name
   * @param {Object[]} terms An array of replacement terms
   */
  constructor(name, terms = []) {
    this.name = name;
    this.createMap(terms);
  }

  /**
   * Create a map of words and their replacements
   *
   * @private
   * @param {Object[]} termArray An array of replacement terms
   */
  createMap(termArray) {
    /**
     * Check whether the term is ambiguous for the key given.
     *
     * @param {string|string[]} ambiguousData Value of the
     *  ambiguous key from the definition
     * @param {string} key Dictionary key
     * @return {boolean} Term is ambiguous for the key
     */
    const isAmbiguous = (ambiguousData, key) => {
      if (!ambiguousData) {
        return false;
      }

      // Normalize to an array
      ambiguousData = Array.isArray(ambiguousData) ? ambiguousData : [ambiguousData];

      return ambiguousData.indexOf(key) > -1;
    };

    this.terms = {};
    termArray.forEach(data => {
      Object.keys(data.terms).forEach(key => {
        // Normalize: Lowercase all keys and terms
        key = key.toLowerCase();
        data.terms[key] = data.terms[key].map(t => t.toLowerCase());

        // Store in main map
        this.terms[key] = this.terms[key] || {};
        data.terms[key].forEach(term => {
          const replaceOptions = Object.assign({}, data.terms);
          // Remove self key
          delete replaceOptions[key];

          // Store in map
          this.terms[key][term] = {
            ambiguous: isAmbiguous(data.ambiguous, key),
            ...replaceOptions
          };
        });
      });
    });
  }

  /**
   * Get the full term map
   *
   * @return {Object} Object map
   */
  getTermMap() {
    return this.terms;
  }

  /**
   * Get the dictionary name
   *
   * @return {string} Dictionary name
   */
  getName() {
    return this.name;
  }

  /**
   * Get all terms for a key, or all terms in the
   * entire dictionary
   *
   * @param {string} key Dictionary key
   * @return {string[]} All terms that are available
   *  for this key
   */
  getAllTerms(key) {
    if (key) {
      key = key.toLowerCase(); // normalize
      if (Object.keys(this.terms).indexOf(key) === -1) {
        return [];
      }
      return Object.keys(this.terms[key]);
    }

    // return all
    let result = [];
    Object.keys(this.terms).forEach(k => {
      result = result.concat(Object.keys(this.terms[k]));
    });
    return result;
  }

  /**
   * Get the options for the given term in the given key
   *
   * @param {string} key Dictionary key
   * @param {string} term Requested term
   * @return {Object} Object describing the available options
   *  for the requested term
   */
  getOptions(key, term) {
    key = key.toLowerCase(); // normalize
    term = term.toLowerCase(); // Normalize
    return this.terms[key] && this.terms[key][term];
  }

  /**
   * Get a single replacement for the given term
   *
   * @param {string} key Dictionary key
   * @param {string} term Requested term
   * @param {string} targetKey The target key for the replacement
   * @return {Object} Object describing a single replacement
   */
  getSingleOption(key, term, targetKey) {
    const data = this.getOptions(key, term) || {};

    return {
      ambiguous: !!data.ambiguous,
      term: data && data[targetKey] && Utils.getRandomArrValue(data[targetKey])
    };
  }
}

export default Dictionary;
