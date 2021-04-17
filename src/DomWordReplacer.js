import xpath from 'xpath';
import parse5 from 'parse5';
import xmlserializer from 'xmlserializer';
import xmldom from 'xmldom';
import Dictionary from './Dictionary.js';

/**
 * Manage the DOM documnent
 *
 * @class DomWordReplacer
 */
class DomWordReplacer {
  /**
   * Instantiate with configuration options
   *
   * @param {Dictionary} dictionary Replacement dictionary
   * @param {Object} [config] Configuration options
   * @param {boolean} [config.showOriginalTerm=true] Show the
   *  original term that was replaced in the title="" prop of
   *  the wrapper span.
   * @param {string} [config.termClass="replaced-term"] The class
   *  name used for the wrapper of replaced terms.
   * @param {string} [config.ambiguousClass="ambiguous-term"] The
   *  class name used for the wrapper of replaced terms, noting
   *  an ambiguous replacement.
   */
  constructor(dictionary, config = {}) {
    this.dictionary = dictionary;

    this.showOriginalTerm = config.showOriginalTerm === undefined ? true : config.showOriginalTerm;
    this.termClass = config.termClass || 'replaced-term';
    this.ambiguousClass = config.ambiguousClass || 'ambiguous-term';
  }

  /**
   * Get an xmldom object from the given html string.
   *
   * @private
   * @param {string} htmlString
   * @return {xmldom} DOM document
   */
  getDocumentFromHtml(htmlString) {
    const document = parse5.parse(htmlString);
    const xhtml = xmlserializer.serializeToString(document);
    return new xmldom.DOMParser().parseFromString(xhtml);
  }
  // sanitize(htmlString)

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
    const doc = this.getDocumentFromHtml(htmlString);
    console.log('DomWordReplacer replace', htmlString);
    /**
     * Sanitize and escape dictionary terms to be used in
     * RegExp expressions.
     *
     * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
     * @param {string} str RegExp string from the dictionary
     * @return {string} Sanitized string
     */
    const escapeRegExp = str => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    // Go over the entire dictionary
    this.dictionary.getAllTerms(dictKeyFrom).forEach(term => {
      // Create the lookup regular expression
      const regex = new RegExp(escapeRegExp(term), 'ig');

      // Look for relevant nodes that may have replacements
      xpath.select(
        `//text()[parent::*[not(contains(@class, '${this.termClass}'))]]`,
        doc
      ).forEach(node => {
        if (
          !node.textContent.match(regex) ||
          node.textContent.match(regex).length === 0
        ) {
          // Skip if there was no match
          return;
        }

        // For all matches, perform the replacement
        const newNodeText = node.textContent.replace(regex, match => {
          // Look it up in the dictionary
          const replacementData = this.dictionary
            .getSingleOption(dictKeyFrom, match, dictKeyTo);
          if (!replacementData.term) {
            // Sanity check
            return match;
          }
          console.log('replacementData', replacementData);
          // Wrap with span and class (add ambiguous class if needed)
          const props = [];
          const cssClasses = [this.termClass];
          if (this.showOriginalTerm) {
            props.push(`alt="${match}"`);
          }
          if (replacementData.ambiguous) {
            cssClasses.push(this.ambiguousClass);
          }
          return `<span class="${cssClasses.join(' ')}" ${props.join(' ')}>${replacementData.term}</span>`;
        });

        // Replace the current node with the new content
        const nodeDoc = this.getDocumentFromHtml(`<div>${newNodeText}</div>`);
        const newNode = nodeDoc.getElementsByTagName('div')[0];
        for (let i = 0; i < newNode.childNodes.length; i++) {
          const child = newNode.childNodes[i];
          // Clone pieces into the old node
          node.parentNode.insertBefore(doc.importNode(child, true), node);
        }

        // Get rid of the old node
        node.parentNode.removeChild(node);
      });
    });

    // Return the html
    return xmlserializer.serializeToString(doc);
  }
}

export default DomWordReplacer;
