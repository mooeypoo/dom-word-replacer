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
  static escapeRegExp(str) {
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

  /**
   * Capitalize the given string; whatever the given case,
   * output a string whre only the first character is capitalized.
   *
   * @param {string} str Requested string
   * @return {string} String with the first character capitalized.
   */
  static capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

export default Utils;
