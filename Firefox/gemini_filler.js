// gemini_filler.js - Content script for YouTube Summarizer with Gemini (Gemini page)
// Reads a prompt from local storage (set by the YouTube content script) and injects it into Gemini's main input field, with a fallback to clipboard.

(() => {
  "use strict";
  
  const SCRIPT_PREFIX = "Gemini Summarizer (Filler):";
  const STORAGE_KEY_PROMPT = "geminiPromptForNextLoad";
  const MAX_ATTEMPTS = 10;
  const ATTEMPT_DELAY_MS = 500;
  let attempts = 0;
  let observer = null;
  let hasPromptToFill = false;
  let fillCompleted = false;
  let activeIntervalId = null;

  function log(level, message, details) {
    const logArgs = details ? [message, details] : [message];
    if (level === 'log') devLog(SCRIPT_PREFIX, ...logArgs);
    else if (level === 'warn') devWarn(SCRIPT_PREFIX, ...logArgs);
    else if (level === 'error') devError(SCRIPT_PREFIX, ...logArgs);
    else devLog(SCRIPT_PREFIX, `[${level.toUpperCase()}]:`, ...logArgs);
  }

  function findGeminiInputTextField() {
    const mainInputSelector = '[aria-label="Enter a prompt for Gemini"]';
    const activatableInputAreaSelector = '.text-input-field';
    
    try {
      const inputArea = document.querySelector(activatableInputAreaSelector);
      if (inputArea) {
        log("log", "Found activatable input area. Clicking it.", inputArea);
        inputArea.click();
      }
    } catch (e) {
      log("warn", `Error trying to click ${activatableInputAreaSelector}: ${e.message}`);
    }
    
    try {
      const element = document.querySelector(mainInputSelector);
      if (element) {
        const isReady = element.offsetParent !== null && !element.disabled && !element.readOnly;
        log(isReady ? "log" : "debug", `Found main input field${isReady ? '' : ' (not ready)'}:`, element);
        return { element, isEnabled: isReady };
      }
    } catch (e) {
      log("warn", `Error with selector ${mainInputSelector}: ${e.message}`);
    }
    
    const fallbackSelector = 'rich-textarea';
    try {
      const fallbackElement = document.querySelector(fallbackSelector);
      if (fallbackElement) {
        const isReady = fallbackElement.offsetParent !== null && 
                       !fallbackElement.disabled && 
                       !fallbackElement.readOnly;
        log(isReady ? "log" : "debug", `Found ${fallbackSelector}${isReady ? '' : ' (not ready)'}:`, fallbackElement);
        return { element: fallbackElement, isEnabled: isReady };
      }
    } catch (e) {
      log("warn", `Error with fallback selector ${fallbackSelector}: ${e.message}`);
    }
    
    log("warn", "Could not find a suitable Gemini input field using known selectors");
    return { element: null, isEnabled: false };
  }

  function injectTextAndDispatchEvents(inputField, text) {
    if (!inputField?.focus) {
      log("error", "Invalid input field provided");
      return false;
    }
    
    try {
      inputField.focus();
      
      // Clear existing content via selection + delete so Quill tracks the change
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(inputField);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Primary approach: execCommand('insertText') — triggers Quill's input handling
      const execResult = document.execCommand('insertText', false, text);
      
      if (execResult && inputField.textContent.trim().length > 0) {
        log("log", "Text injected via execCommand('insertText')");
        return true;
      }
      
      log("warn", "execCommand('insertText') did not work, trying clipboard paste");
      
      // Fallback: Clipboard API paste simulation
      try {
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', text);
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: clipboardData
        });
        inputField.dispatchEvent(pasteEvent);
        
        // Check if paste was handled
        if (inputField.textContent.trim().length > 0) {
          log("log", "Text injected via clipboard paste event");
          return true;
        }
      } catch (clipErr) {
        log("warn", "Clipboard paste fallback failed:", clipErr);
      }
      
      // Last resort: direct DOM manipulation + InputEvent
      log("warn", "Using direct DOM fallback (send button may not appear)");
      while (inputField.firstChild) {
        inputField.removeChild(inputField.firstChild);
      }
      const p = document.createElement('p');
      p.textContent = text;
      inputField.appendChild(p);
      
      inputField.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
      }));
      
      log("debug", "Text injected via direct DOM manipulation (last resort)");
      return true;
    } catch (e) {
      log("error", "Failed to inject text:", e);
      return false;
    }
  }

  function findAndClickSendButton() {
    const sendButton = document.querySelector("button[aria-label='Send message']");
    
    if (!sendButton?.offsetParent || sendButton.disabled) {
      log("debug", "Send button not found or not clickable");
      return false;
    }
    
    log("log", "Clicking send button");
    
    try {
      sendButton.click();
      log("debug", "Send button clicked successfully");
    } catch (e) {
      log("error", "Error clicking send button:", e);
    }
    
    return true;
  }

  function simulateEnterKeyPress(inputField) {
    if (window.__geminiEnterKeyPressed) {
      log("debug", "Enter key was already pressed recently");
      return;
    }
    
    log("log", "Simulating Enter key press");
    window.__geminiEnterKeyPressed = true;
    
    setTimeout(() => {
      try {
        const eventOpts = { 
          key: 'Enter', 
          code: 'Enter', 
          keyCode: 13, 
          which: 13, 
          bubbles: true, 
          cancelable: true 
        };
        
        inputField.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
        inputField.dispatchEvent(new KeyboardEvent('keyup', eventOpts));
        log("debug", "Enter key press simulated");
      } catch (e) {
        log("error", "Error simulating Enter key:", e);
      }
    }, 150);
    
    setTimeout(() => {
      window.__geminiEnterKeyPressed = false;
    }, 2000);
  }

  async function clearPromptFromStorage() {
    try {
      await (typeof browser !== "undefined" ? browser : chrome).storage.local.remove(STORAGE_KEY_PROMPT);
      log("log", "Prompt cleared from local storage.");
    } catch (error) {
      log("error", "Error clearing prompt from storage:", error);
    }
  }

  function stopAllPolling() {
    if (activeIntervalId) {
      clearInterval(activeIntervalId);
      activeIntervalId = null;
    }
    observer?.disconnect();
    observer = null;
    log("debug", "All polling and observers stopped");
  }

  async function attemptToFillPrompt() {
    // Prevent re-entry after a successful fill
    if (fillCompleted) {
      log("debug", "Fill already completed, skipping");
      return true;
    }
    
    attempts++;
    log("debug", `Attempt ${attempts}/${MAX_ATTEMPTS}`);
    
    const storage = typeof browser !== "undefined" ? browser.storage.local : chrome.storage.local;
    let promptText;
    
    try {
      const data = await storage.get(STORAGE_KEY_PROMPT);
      promptText = data?.[STORAGE_KEY_PROMPT];
    } catch (error) {
      log("error", "Storage error:", error);
      return false;
    }
    
    if (!promptText) {
      hasPromptToFill = false;
      return false;
    }
    
    hasPromptToFill = true;
    const { element: inputField, isEnabled } = findGeminiInputTextField();
    
    if (!inputField) {
      if (attempts >= MAX_ATTEMPTS) {
        showError("Could not find the input field. Please try again.");
        await clearPromptFromStorage();
      }
      return false;
    }
    
    if (!isEnabled) {
      log("debug", "Input field not ready yet");
      return false;
    }
    
    log("log", "Filling prompt into input field");
    
    if (!injectTextAndDispatchEvents(inputField, promptText)) {
      if (attempts >= MAX_ATTEMPTS) {
        showError("Failed to fill the prompt. Please try again.");
        await clearPromptFromStorage();
      }
      return false;
    }
    
    // Mark as completed and stop all polling IMMEDIATELY to prevent re-entry
    fillCompleted = true;
    hasPromptToFill = false;
    stopAllPolling();
    await clearPromptFromStorage();
    
    log("debug", "Waiting for Quill to process input before submitting");
    
    // Give Quill/Angular time to process the input and render the send button
    await new Promise(resolve => setTimeout(resolve, 800));
    
    log("debug", "Submitting form");
    
    if (!findAndClickSendButton()) {
      // Retry after another short delay — send button may still be rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!findAndClickSendButton()) {
        log("warn", "Send button not found after retries. Prompt is filled — you can submit manually.");
      }
    }
    
    return true;
  }
  
  function showError(message) {
    log("error", message);
    // Only show alert if we're not in a background context
    if (typeof window !== 'undefined' && window.alert) {
      alert(`Gemini Summarizer: ${message}`);
    }
  }

  function setupMutationObserver(element) {
    observer?.disconnect();
    
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes') continue;
        
        const isRelevantChange = ['disabled', 'class', 'style'].includes(mutation.attributeName);
        if (!isRelevantChange) continue;
        
        const isNowEnabled = !element.disabled && 
                           element.offsetParent !== null && 
                           !element.readOnly &&
                           window.getComputedStyle(element).display !== 'none';
        
        log("debug", `Input field ${isNowEnabled ? 'enabled' : 'disabled'}`);
        
        if (isNowEnabled && hasPromptToFill) {
          log("log", "Input field became enabled, attempting to fill prompt");
          attemptToFillPrompt();
        }
      }
    });
    
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['disabled', 'class', 'style'],
      childList: false,
      subtree: false
    });
    
    log("debug", "MutationObserver set up on input field");
  }

  function scheduleAttempt() {
    const { element: inputField, isEnabled } = findGeminiInputTextField();
    
    if (inputField) {
      setupMutationObserver(inputField);
      
      if (isEnabled) {
        log("log", "Input field is ready, attempting to fill");
        attemptToFillPrompt();
      } else {
        log("debug", "Input field found but not yet enabled");
      }
    } else {
      log("debug", "Input field not found yet, will retry");
    }
    
    activeIntervalId = setInterval(async () => {
      // Check if fill already completed (prevents re-entry race conditions)
      if (fillCompleted) {
        stopAllPolling();
        return;
      }
      
      if (attempts >= MAX_ATTEMPTS) {
        stopAllPolling();
        log("warn", `Max attempts (${MAX_ATTEMPTS}) reached`);
        return;
      }
      
      const storage = typeof browser !== "undefined" ? browser.storage.local : chrome.storage.local;
      const data = await storage.get(STORAGE_KEY_PROMPT);
      
      if (!data?.[STORAGE_KEY_PROMPT]) {
        log("debug", "No prompt found in storage, stopping");
        stopAllPolling();
        return;
      }
      
      hasPromptToFill = true;
      const { element: field, isEnabled } = findGeminiInputTextField();
      
      if (!field) {
        log("debug", `Input field not found (attempt ${++attempts}/${MAX_ATTEMPTS})`);
        return;
      }
      
      if (isEnabled) {
        log("log", "Input field ready, attempting to fill");
        attemptToFillPrompt();
      } else if (!observer) {
        log("debug", "Input field found but disabled, setting up observer");
        setupMutationObserver(field);
      }
    }, ATTEMPT_DELAY_MS);
    
    window.addEventListener('unload', () => stopAllPolling());
  }

  log("log", "Gemini filler script initialized.");
  scheduleAttempt();

})();
