/**
 * Utility class for helper functions
 */
class Utils {
  /**
   * Sanitize and escape dictionary terms to be used in
   * RegExp expressions.
   *
   * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
   * @param {string} str RegExp string from the dictionary
   * @return {string} Sanitized string
   */
  static escapeRegExp (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get a random value from given array
   *
   * @param {string[]} arr Given array
   * @return {string} Random array value
   */
  static getRandomArrValue(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Utils;
