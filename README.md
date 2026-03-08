# YouTube Summarizer (Dawnflare)

A browser extension that adds a **"✨ Summarize with Gemini"** button to YouTube video pages. Clicking the button opens Google Gemini in a new tab with a pre-filled prompt to summarize the video. Supports both **Chromium-based browsers** (Chrome, Edge, Brave, etc.) and **Firefox**.

---

## Features

- Adds a "✨ Summarize with Gemini" button on YouTube video pages (desktop and mobile).
- Automatically opens Gemini and fills the prompt with the video URL.
- Automatically submits the prompt for hands-free summarization.
- Handles dynamic page loading on YouTube (SPA navigation).
- Works with Gemini's Quill-based editor using `execCommand('insertText')` for reliable text injection.
- Configurable verbose logging for development and troubleshooting.

## Browser Support

| Browser | Folder | Manifest Version | Min Version |
|---------|--------|-----------------|-------------|
| Chrome / Chromium-based | `Chromium/` | Manifest V3 | Chrome 88+ |
| Firefox | `Firefox/` | Manifest V2 | Firefox 109+ |

## Installation

### Chromium (Chrome, Edge, Brave, etc.)

1. Download or clone this repository.
2. Open your browser and navigate to `chrome://extensions` (or the equivalent for your browser).
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked**.
5. Select the `Chromium/` folder from this repository.

### Firefox

1. Download or clone this repository.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Navigate to the `Firefox/` folder and select `manifest.json`.

> **Note:** Temporary add-ons are removed when Firefox closes. For permanent installation, the extension must be signed and distributed via [AMO](https://addons.mozilla.org/).

## Usage

1. Navigate to a YouTube video page (e.g., `https://www.youtube.com/watch?v=...`).
2. Look for the **"✨ Summarize with Gemini"** button below the video title.
3. Click the button.
4. A new tab opens to `https://gemini.google.com/app` with the prompt pre-filled and auto-submitted.
5. Gemini will summarize the video page for you.

## Project Structure

```
youtube-summarizer-extension/
├── Chromium/                 # Chromium extension (Manifest V3)
│   ├── manifest.json
│   ├── content.js            # Injects button on YouTube pages
│   ├── gemini_filler.js      # Fills & submits prompt on Gemini
│   ├── logging.js            # Shared logging utilities
│   ├── options.html          # Extension options page
│   ├── options.js            # Options page logic
│   ├── style.css             # Button styles
│   └── images/               # Extension icons
├── Firefox/                  # Firefox extension (Manifest V2)
│   ├── manifest.json
│   ├── content.js            # Same as Chromium
│   ├── gemini_filler.js      # Same as Chromium
│   ├── logging.js            # Uses browser.* API
│   ├── options.html          # Same as Chromium
│   ├── options.js            # Uses browser.* API
│   ├── style.css             # Same as Chromium
│   └── images/               # Same icons
├── tests/                    # Integration tests (Playwright)
├── README.md
├── PRIVACY.md
├── LICENSE
├── BEST_PRACTICES.md
├── package.json
└── playwright.config.js
```

### Key Files

| File | Purpose |
|------|---------|
| `content.js` | Injects the "✨ Summarize with Gemini" button on YouTube watch pages. Handles SPA navigation events. |
| `gemini_filler.js` | Runs on `gemini.google.com/app`. Reads the stored prompt and injects it into Gemini's Quill editor using `execCommand('insertText')`, then clicks the send button. |
| `logging.js` | Provides `devLog`, `devWarn`, `devError` functions. Logging verbosity is controlled via the options page. |
| `options.html` / `options.js` | Options page with a toggle for verbose console logging. |
| `style.css` | Styles for the injected button. |

### Chromium vs Firefox Differences

| Aspect | Chromium | Firefox |
|--------|----------|---------|
| Manifest version | V3 | V2 |
| Toolbar button | `action` | `browser_action` |
| Host permissions | Top-level `host_permissions` | Merged into `permissions` |
| CSP format | Object (`extension_pages`) | String |
| Storage API | `chrome.storage.local` (callbacks) | `browser.storage.local` (Promises) |

> **Note:** `content.js` and `gemini_filler.js` use a cross-browser pattern (`typeof browser !== 'undefined' ? browser : chrome`) and work identically on both browsers without modification.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (includes npm)

### Setup

```bash
git clone https://github.com/Dawnflare/youtube-summarizer-extension.git
cd youtube-summarizer-extension
npm install
```

### Running Tests

This project uses [Playwright](https://playwright.dev/) for integration testing:

```bash
# Run all integration tests
npm test

# Run quick button-presence test
npm run test:quick

# Run tests in headed mode (visible browser)
npm run test:headed

# Generate test code with Playwright Codegen
npm run codegen
```

### Testing the Extension Locally

**Chromium:** Load `Chromium/` as an unpacked extension (see Installation above). After making changes, click the reload icon on `chrome://extensions`.

**Firefox:** Load `Firefox/manifest.json` as a temporary add-on (see Installation above). After making changes, click "Reload" on `about:debugging`.

### Packaging for Firefox (AMO Submission)

To generate a `.zip` file suitable for submission to [Mozilla Add-ons (AMO)](https://addons.mozilla.org/):

```bash
npm run build:firefox
```

This creates `firefox-extension.zip` in the project root with `manifest.json` at the archive root (an AMO requirement).

**Submitting to AMO:**

1. Go to [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) and sign in with your Mozilla account.
2. Click **Submit a New Add-on** (or **Upload New Version** for updates).
3. Upload the `firefox-extension.zip` file.
4. Complete the listing details (description, screenshots, categories).
5. Submit for review — Mozilla will review the extension before it goes live.

## Security & Privacy

- [Best Practices](BEST_PRACTICES.md) — Security measures implemented in this extension.
- [Privacy Policy](PRIVACY.md) — How your data is handled.

## Disclaimer

This is an independent extension and is not affiliated with, endorsed by, or sponsored by Google, YouTube, or Gemini. All product names, logos, and brands are property of their respective owners.

Using the Gemini service may be subject to Google's terms and policies. If you have billing enabled for Google Cloud services, charges for Gemini API usage may apply.

## Version History

### v1.0
- Reorganized into separate `Chromium/` and `Firefox/` directories
- Added full Firefox support (Manifest V2)
- Fixed Gemini filler to work with Quill editor (`execCommand('insertText')`)
- Fixed prompt re-entry bug that caused "You stopped this response"
- Updated extension name to "YouTube Summarizer (Dawnflare)"

### v0.0.3
- Improved input field detection and handling
- Added MutationObserver to detect when input field becomes enabled
- Added protection against duplicate form submissions
- Enhanced error handling and logging

### v0.0.2
- Initial release with basic functionality

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the [MIT License](LICENSE).
