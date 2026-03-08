/**
 * Provides logging functionality with configurable verbosity levels.
 * Logs can be enabled/disabled through browser storage sync.
 * Firefox version — uses browser.storage.local API.
 */

(() => {
  "use strict";

  let verboseLoggingEnabled = false;

  /**
   * Initializes verbose logging state and sets up storage change listener
   * @private
   */
  function initVerboseLogging() {
    try {
      browser.storage.local.get({ verboseLogging: false }).then((items) => {
        verboseLoggingEnabled = items.verboseLogging;
      });

      browser.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.verboseLogging) {
          verboseLoggingEnabled = changes.verboseLogging.newValue;
        }
      });
    } catch (error) {
      console.error("Failed to initialize logging:", error);
    }
  }

  /**
   * Checks if verbose logging is enabled
   * @returns {boolean} True if verbose logging is enabled
   */
  function isVerboseLoggingEnabled() {
    return verboseLoggingEnabled;
  }

  /**
   * Logs a message if verbose logging is enabled
   * @param {string} prefix - Prefix for the log message
   * @param {...any} args - Additional arguments to log
   */
  function devLog(prefix, ...args) {
    if (verboseLoggingEnabled) {
      console.log(prefix, ...args);
    }
  }

  /**
   * Logs a warning if verbose logging is enabled
   * @param {string} prefix - Prefix for the warning message
   * @param {...any} args - Additional arguments to log
   */
  function devWarn(prefix, ...args) {
    if (verboseLoggingEnabled) {
      console.warn(prefix, ...args);
    }
  }

  /**
   * Logs an error message (always logged regardless of verbose setting)
   * @param {string} prefix - Prefix for the error message
   * @param {...any} args - Additional arguments to log
   */
  function devError(prefix, ...args) {
    console.error(prefix, ...args);
  }

  // Initialize logging on script load
  initVerboseLogging();

  // Export logging functions
  window.devLog = devLog;
  window.devWarn = devWarn;
  window.devError = devError;
  window.isVerboseLoggingEnabled = isVerboseLoggingEnabled;
})();
