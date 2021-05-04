import domino from 'domino';
import serialize from 'w3c-xmlserializer';
import Replacer from './Replacer';
import Utils from './Utils';

/**
 * Manage the DOM documnent
 *
 * @class DomWordReplacer
 */
class DomManager {
  /**
   * Instantiate with configuration options
   *
   * @param {Object} dictionaryDefinition Replacement dictionary
   *  definition object.
   * @param {Object} [config] Configuration options
   * @param {boolean} [config.showOriginalTerm=true] Show the
   *  original term that was replaced in the title="" prop of
   *  the wrapper span.
   * @param {boolean} [config.showDictionaryKeys] Show the dictionary
   *  key used for the replacement. If set to true, data-replaced-from=
   *  and data-replaced-to will be added as data props to every
   *  replacement wrapper.
   * @param {boolean} [config.stripScriptTags=true] Automatically
   *  strip and remove all <script> tags from the result
   * @param {boolean} [config.keepSameCase=true] Attempt to keep the
   *  same case from the original word when replacing. The only cases
   *  that are kept are capitalization ('Foo') and full caps ('FOO')
   *  otherwise the match will be outputted all-lowercase.
   * @param {boolean} [config.suggestionMode] A mode that does not
   *  replace the given words. Instead, it tags the matches with a
   *  span that provides the possible option replacements and whether
   *  they are ambiguous. This can then be used in a frontend to provide
   *  suggestions for replacements without outright replacing the words.
   * @param {string} [config.css] A css string to inject to the page.
   *  This is used mostly to style the replacement term classes
   *  on the outputted html.
   * @param {string} [config.termClass="replaced-term"] The class
   *  name used for the wrapper of replaced terms.
   * @param {string} [config.ambiguousClass="ambiguous-term"] The
   *  class name used for the wrapper of replaced terms, noting
   *  an ambiguous replacement.
   */
  constructor(dictionaryDefinition, config = {}) {
    this.replacer = new Replacer(dictionaryDefinition);

    this.showOriginalTerm = config.showOriginalTerm === undefined ? true : config.showOriginalTerm;
    this.stripScriptTags = config.stripScriptTags === undefined ? true : config.stripScriptTags;
    this.keepSameCase = config.keepSameCase === undefined ? true : config.keepSameCase;
    this.suggestionMode = !!config.suggestionMode;
    this.showDictionaryKeys = !!config.showDictionaryKeys;
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
    if (this.stripScriptTags) {
      const nodes = doc.getElementsByTagName('script');
      for (let i = 0; i < nodes.length; i++) {
        // Remove the node
        nodes[i].parentNode.removeChild(nodes[i]);
      }
    }
  }

  /**
   * Inject a CSS string into the DOM as a <style> tag.
   *
   * @param {Document} doc Document to inject into
   */
  injectCss(doc) {
    if (!this.css) {
      return;
    }

    const headNode = doc.getElementsByTagName('head')[0];
    const cssNode = doc.createElementNS('http://www.w3.org/1999/xhtml', 'style');
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
    if (!baseUrl) {
      return;
    }

    const headNode = doc.getElementsByTagName('head')[0];
    const baseNode = doc.createElementNS('http://www.w3.org/1999/xhtml', 'base');
    baseNode.setAttribute('href', baseUrl);
    baseNode.setAttribute('target', '_blank');
    const existingBaseElement = doc.getElementsByTagName('base');
    if (existingBaseElement.length && existingBaseElement[0].parentElement) {
      existingBaseElement[0].parentElement.insertBefore(baseNode, existingBaseElement[0]);
      existingBaseElement[0].parentElement.removeChild(existingBaseElement[0]);
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
    const doc = this.getDocumentFromHtml(htmlString);
    this.sanitize(doc);
    this.injectCss(doc);

    this.addBaseUrl(doc, options.baseUrl);

    this.performReplacementForDictionaryKey(doc, dictKeyFrom, dictKeyTo);

    if (options.replaceBothWays) {
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
    const regex = new RegExp(
      this.replacer.getRegExpForAllTerms(dictKeyFrom),
      'gi'
    );

    // Traverse the dom tree
    // NodeFilter.SHOW_TEXT = 4
    const tw = doc.createNodeIterator(doc.body, 4, null, false);
    let node = tw.nextNode();
    while (node) {
      const matches = node.textContent.match(regex);
      if (!matches || !matches.length) {
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
      const newNodeContent = node.textContent.replace(regex, match => {

        // Wrap with span and class (add ambiguous class if needed)
        const props = [];
        const cssClasses = [this.termClass];
        if (this.showOriginalTerm && !this.suggestionMode) {
          props.push(`title="${match}"`);
        }

        if (this.showDictionaryKeys) {
          // Add data- props
          props.push(`data-replaced-from="${dictKeyFrom}"`);
          props.push(`data-replaced-to="${dictKeyTo}"`);
        }

        // Look it up in the dictionary
        let replacedTerm = match;
        let replacementData = {};
        if (!this.suggestionMode) {
          replacementData = this.replacer
            .getSingleReplacementData(match, dictKeyFrom, dictKeyTo);

          replacedTerm = this.keepSameCase ?
            this.replacer.matchCase(match, replacementData.term) :
            replacementData.term;
        } else {
          // Suggestion mode
          replacementData = this.replacer
            .getAllReplacementsData(match, dictKeyFrom, dictKeyTo);

          const termList = replacementData.terms
            .map(t => {
              return `'${Utils.encodeHTML(t)}'`;
            })
            .join(',');
          props.push(`data-replacement-options="[${termList}]"`);
        }

        if (replacementData.ambiguous) {
          cssClasses.push(this.ambiguousClass);
        }
        // Replacement
        return `<span class="${cssClasses.join(' ')}" ${props.join(' ')}>${replacedTerm}</span>`;
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
