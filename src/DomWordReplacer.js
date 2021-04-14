/**
 * The wrapper class for the main behavior.
 * Instantiates with configuration that includes the dictionaries for replacements
 * and allows for running the replacement on individual html strings.
 *
 * @class DomWordReplacer
 */
class DomWordReplacer {
  /**
   * Instantiates with configuration options.
   *
   * @param {Object} config Configuration options
   */
  constructor(config = {}) {
    this.config = config;
  }
}

export default DomWordReplacer;
