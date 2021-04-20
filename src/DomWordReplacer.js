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
   * @return {string} New html content
   */
  replace(htmlString, dictKeyFrom, dictKeyTo, baseUrl = '') {
    return this.manager.replace(htmlString, dictKeyFrom, dictKeyTo, baseUrl);
  }
}

export default DomWordReplacer;
