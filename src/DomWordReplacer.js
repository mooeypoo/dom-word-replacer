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
   * @return {string} New html content
   */
  replace(htmlString, dictKeyFrom, dictKeyTo) {
    return this.manager.replace(htmlString, dictKeyFrom, dictKeyTo);
  }
}

export default DomWordReplacer;
