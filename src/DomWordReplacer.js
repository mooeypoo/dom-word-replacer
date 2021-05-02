import DomManager from './DomManager.js';

/**
 * Replace words in an HTML document
 *
 * @class DomWordReplacer
 */
class DomWordReplacer {
  /**
   * Instantiate the object with given definitions.
   *
   * @param {Object} dictDefinition Dictionary definition
   * @param {Object} config Configuration options
   */
  constructor(dictDefinition, config) {
    this.manager = new DomManager(
      dictDefinition,
      config
    );
  }

  /**
   * Load html document and perform the replacements.
   *
   * @param {string} htmlString HTML content
   * @param {string} dictKeyFrom The dictionary key used
   *  to look for matches
   * @param {string} dictKeyTo The dictionary key used
   *  to look for replacements
   * @param {Object} [options] Optional paramters for the
   *  replacement operation
   * @param {string} [options.baseUrl] A url representing the new
   *  <base> href for the given document. Ignore if not
   *  given.
   * @param {boolean} [options.replaceBothWays] If set to true, the
   *  replacement will happen twice -- once for the keyFrom,
   *  and once for the keyTo, producing a two-way translation.
   * @return {string} New html content
   */
  replace(htmlString, dictKeyFrom, dictKeyTo, options = {}) {
    return this.manager.replace(
      htmlString,
      dictKeyFrom,
      dictKeyTo,
      options
    );
  }
}

export default DomWordReplacer;
