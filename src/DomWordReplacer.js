import DomManager from './DomManager.js';
import Dictionary from './Dictionary.js';

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
      new Dictionary(dictDefinition.name, dictDefinition.terms),
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
   * @param {string} [baseUrl] A url representing the new
   *  <base> href for the given document. Ignore if not
   *  given.
   * @param {boolean} [replaceBothWays] If set to true, the
   *  replacement will happen twice -- once for the keyFrom,
   *  and once for the keyTo, producing a two-way translation.
   * @return {string} New html content
   */
  replace(htmlString, dictKeyFrom, dictKeyTo, baseUrl = '', replaceBothWays = false) {
    return this.manager.replace(htmlString, dictKeyFrom, dictKeyTo, baseUrl, replaceBothWays);
  }
}

export default DomWordReplacer;
