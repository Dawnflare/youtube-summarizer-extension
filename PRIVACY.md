# Privacy Policy for YouTube Summarizer (Dawnflare) Extension

**Last Updated: 2026-03-09**

This Privacy Policy describes how the "YouTube Summarizer with Gemini" browser extension (the "Extension") handles your information.

## 1. Information We Handle

The Extension processes the following information:

*   **YouTube Video URL:** When you click the "✨ Summarize with Gemini" button on a YouTube video page, the Extension accesses the URL of that current YouTube page.
*   **Generated Prompt:** The Extension creates a text prompt that includes the YouTube video URL (e.g., "Please summarize this YouTube page: [URL]").
*   **Extension Settings:** The Extension stores your preference for "Enable Verbose Console Logging" (a true/false value) if you configure it in the Extension's options.

## 2. How We Use Information

*   **To Enable Summarization:** The YouTube video URL is used solely to create the prompt. This prompt is then temporarily stored in your browser's local storage (`chrome.storage.local`). When you are redirected to `gemini.google.com`, a script attempts to automatically fill this prompt into the Gemini input field.
*   **To Store Your Preferences:** The "Enable Verbose Console Logging" setting is stored in your browser's local storage (`chrome.storage.local`) to control the level of diagnostic messages printed to the browser's developer console.

## 3. Data Sharing and Third Parties

*   **Gemini (Google):** The generated prompt (which includes the YouTube video URL) is passed to `gemini.google.com` when the Extension fills the input field on that site. Your interaction with `gemini.google.com` and any data you provide to it (including the prompt filled by this Extension) is subject to Google's Privacy Policy and Terms of Service. This Extension does not control how Google handles your data.
*   **No Other Sharing:** We do not share your information with any other third parties. No information is sent to the developer of this Extension or any other servers, apart from the interaction with `gemini.google.com` described above.

## 4. Data Storage and Retention

*   **Temporary Prompt Storage:** The generated prompt containing the YouTube URL is stored in your browser's local extension storage (`chrome.storage.local`) only for the brief period between clicking the "Summarize" button and the successful attempt to fill it into the Gemini website. The Extension attempts to delete this prompt from local storage immediately after it has been used.
*   **Extension Settings Storage:** The "verboseLogging" preference is stored in `chrome.storage.local` and persists until you change it, clear your browser's local storage, or uninstall the Extension.
*   **No External Storage:** No data is stored outside of your browser's local extension storage.

## 5. Your Choices and Rights

*   You can control the "verboseLogging" setting through the Extension's options page.
*   You can clear your browser's local storage, which would remove any data stored by this Extension, through your browser's settings.
*   You can uninstall the Extension at any time to remove it and its stored data completely.

## 6. Security

We take reasonable precautions to protect the information handled by the Extension by storing it locally within your browser's extension storage mechanisms.

## 7. Disclaimer

This Extension is an independent project and is not affiliated with, endorsed by, or sponsored by Google LLC, YouTube, or Gemini. All trademarks, service marks, trade names, trade dress, product names, and logos appearing on the site are the property of their respective owners.

Use of the Gemini service via this Extension is subject to Google's terms and policies. If your Google account has billing enabled for Google Cloud services, charges may apply for Gemini API usage based on your interactions with the Gemini website. This Extension does not control or manage any such charges.

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the Extension's `README.md`, `PRIVACY.md` file, and potentially on the extension store listing. You are advised to review this Privacy Policy periodically for any changes.

## 9. Contact Us

If you have any questions about this Privacy Policy, please open an issue on our GitHub repository: [https://github.com/Dawnflare/youtube-summarizer-extension/issues](https://github.com/Dawnflare/youtube-summarizer-extension/issues)

