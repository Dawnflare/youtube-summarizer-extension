// options.js — Firefox version (uses browser.storage.local API)
document.addEventListener('DOMContentLoaded', () => {
  const verboseLoggingCheckbox = document.getElementById('verboseLogging');

  // Load the current setting and update the checkbox
  browser.storage.local.get({ verboseLogging: false }).then((items) => {
    verboseLoggingCheckbox.checked = items.verboseLogging;
  });

  // Save the setting when the checkbox changes
  verboseLoggingCheckbox.addEventListener('change', () => {
    browser.storage.local.set({ verboseLogging: verboseLoggingCheckbox.checked }).then(() => {
      console.log('Verbose logging setting saved:', verboseLoggingCheckbox.checked);
    });
  });
});
