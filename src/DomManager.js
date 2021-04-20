import domino from 'domino';
import serialize from 'w3c-xmlserializer';
import Dictionary from './Dictionary.js';
/**
 * Manage the DOM documnent
 *
 * @class DomWordReplacer
 */
class DomManager {
  /**
   * Instantiate with configuration options
   *
   * @param {Dictionary} dictionary Replacement dictionary
   * @param {Object} [config] Configuration options
   * @param {boolean} [config.showOriginalTerm=true] Show the
   *  original term that was replaced in the title="" prop of
   *  the wrapper span.
   * @param {boolean} [config.stripScriptTags=true] Automatically
   *  strip and remove all <script> tags from the result
   * @param {string} [config.css] A css string to inject to the page.
   *  This is used mostly to style the replacement term classes
   *  on the outputted html.
   * @param {string} [config.termClass="replaced-term"] The class
   *  name used for the wrapper of replaced terms.
   * @param {string} [config.ambiguousClass="ambiguous-term"] The
   *  class name used for the wrapper of replaced terms, noting
   *  an ambiguous replacement.
   */
  constructor(dictionary, config = {}) {
    this.dictionary = dictionary;

    this.showOriginalTerm = config.showOriginalTerm === undefined ? true : config.showOriginalTerm;
    this.stripScriptTags = config.stripScriptTags === undefined ? true : config.showOriginalTerm;
    this.termClass = config.termClass || 'replaced-term';
    this.ambiguousClass = config.ambiguousClass || 'ambiguous-term';
    this.css = config.css;
  }

  /**
   * Get an xmldom object from the given html string.
   *
   * @private
   * @param {string} htmlString
   * @return {domino} DOM document
   */
  getDocumentFromHtml(htmlString) {
    return domino.createDocument(htmlString, true);
  }

  /**
   * Strip script tags and sanitize the given html string.
   *
   * @param {Document} doc to strip scripts from
   */
  sanitize(doc) {
    const nodes = doc.getElementsByTagName('script');
    for (let i = 0; i < nodes.length; i++) {
      // Remove the node
      nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  /**
   * Inject a CSS string into the DOM as a <style> tag.
   *
   * @param {Document} doc Document to inject into
   */
  injectCss(doc) {
    const headNode = doc.getElementsByTagName('head')[0];
    const cssNode = doc.createElementNS('http //www.w3.org/1999/xhtml', 'style');
    cssNode.appendChild(doc.createTextNode(this.css));
    headNode.insertBefore(cssNode, headNode.firstChild);
  }

  /**
   * Add a base url rule through <base> node
   *
   * @param {Document} doc Document to add the tag to
   * @param {string} baseUrl A url representing the base url
   *  for the outputted doc.
   */
  addBaseUrl(doc, baseUrl) {
    const headNode = doc.getElementsByTagName('head')[0];
    const baseNode = doc.createElementNS('http //www.w3.org/1999/xhtml', 'base');
    baseNode.setAttribute('href', baseUrl);
    baseNode.setAttribute('target', '_blank');
    const existingBaseElement = doc.getElementsByTagName('base');
    if (existingBaseElement.length) {
      doc.parentElement.insertBefore(baseNode, existingBaseElement);
      doc.parentElement.removeChild(existingBaseElement);
    } else {
      headNode.insertBefore(baseNode, headNode.firstChild);
    }
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
    const doc = this.getDocumentFromHtml(htmlString);
    if (this.stripScriptTags) {
      this.sanitize(doc);
    }

    if (this.css) {
      this.injectCss(doc);
    }

    if (baseUrl) {
      this.addBaseUrl(doc, baseUrl);
    }

    this.performReplacementForDictionaryKey(doc, dictKeyFrom, dictKeyTo);

    if (replaceBothWays) {
      // Replace the other way too
      this.performReplacementForDictionaryKey(doc, dictKeyTo, dictKeyFrom);
    }

    // Return the html
    return serialize(doc);
  }

  /**
   * Perform the actual replacements in the document, based on given keys
   *
   * @param {Document} doc Document to perform replacements on
   * @param {string} dictKeyFrom The dictionary key used
   *  to look for matches
   * @param {string} dictKeyTo The dictionary key used
   *  to look for replacements
   */
  performReplacementForDictionaryKey(doc, dictKeyFrom, dictKeyTo) {
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

    const regex = new RegExp(
      this.dictionary.getAllTerms(dictKeyFrom)
        .map(v => {
          return `\\b${escapeRegExp(v)}\\b`;
        })
        .join('|'),
      'g'
    );

    // Traverse the dom tree
    // NodeFilter.SHOW_TEXT = 4
    const tw = doc.createNodeIterator(doc.body, 4, null, false);
    let node = tw.nextNode();
    while (node) {
      const matches = node.textContent.match(regex);
      if (
        !matches ||
        !matches.length
      ) {
        // Skip if there was no match
        node = tw.nextNode();
        continue;
      }

      // Make sure the parent does not already have the classes
      if (
        (node.classList && node.classList.contains(this.termClass)) ||
        (node.parentNode.classList && node.parentNode.classList.contains(this.termClass))
      ) {
        node = tw.nextNode();
        continue;
      }

      // For all matches, perform the replacement
      let newNodeContent = node.textContent;
      matches.forEach(match => {
        // Look it up in the dictionary
        const replacementData = this.dictionary
          .getSingleOption(dictKeyFrom, match, dictKeyTo);
        if (!replacementData.term) {
          // Sanity check
          return match;
        }
        // Wrap with span and class (add ambiguous class if needed)
        const props = [];
        const cssClasses = [this.termClass];
        if (this.showOriginalTerm) {
          props.push(`title="${match}"`);
        }

        if (replacementData.ambiguous) {
          cssClasses.push(this.ambiguousClass);
        }

        // Replace in the newNodeContent
        newNodeContent = newNodeContent.replace(
          match,
          `<span class="${cssClasses.join(' ')}" ${props.join(' ')}>${replacementData.term}</span>`);
      });

      // Replace the current node with the new content
      const nodeDoc = this.getDocumentFromHtml(`<div>${newNodeContent}</div>`);
      const newNode = nodeDoc.getElementsByTagName('div')[0];
      for (let i = 0; i < newNode.childNodes.length; i++) {
        const child = newNode.childNodes[i];
        // Clone pieces into the old node
        node.parentNode.insertBefore(doc.importNode(child, true), node);
      }

      // Get rid of the old node
      node.parentNode.removeChild(node);
      node = tw.nextNode();
    }
  }
}

export default DomManager;
