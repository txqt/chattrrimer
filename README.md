# ChatTrimmer

Fold away the old messages in **ChatGPT** so long conversations stop feeling sluggish. Folded messages stay in the page — unfold any of them whenever you need to.

## Features

- **Auto-fold old messages** — keep only the last N messages visible; older ones are folded out of the layout.
- **Conversation Fold Map** — the folded part is split into chunks, each with its own **Expand** button.
- **Unfold everything** — one click restores the whole conversation.
- **Tail Window Size** — a slider that controls how many recent messages stay visible (10–100).
- **Sender stats** — your messages vs ChatGPT's, with percentages.
- **CSV export** of the full conversation.
- **On-page button** ("Unfold N · M folded") that appears whenever anything is folded.

## Supported platform

**ChatGPT** only (`chatgpt.com`, `chat.openai.com`). Other AI chats are not supported yet.

## Install (load unpacked)

1. Download this repository.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extension folder.
5. Open a conversation on ChatGPT and reload the page.

## Localization

The UI ships with **English** and **Vietnamese**. There is a small **EN / VI** switch in the
popup footer, and the choice is remembered.

- On first run the language follows the browser UI language (via `chrome.i18n`).
- Picking EN or VI overrides it and is stored in `chrome.storage.sync`.
- The on-page button follows the same setting.
- UI strings live in `src/i18n.js`; `_locales/` only carries the extension name and description
  (Chrome needs those at install time and they follow the browser language).

To add a language: add a dictionary to `src/i18n.js`, list its code in `LANGS`, and copy
`_locales/en/` to `_locales/<code>/` for the store name and description.

## Project structure

```
manifest.json         # Manifest V3 (ChatGPT hosts only)
popup.html / .css     # Popup UI — "Thread Accordion"
src/i18n.js           # UI strings (en / vi) + runtime language switch
src/popup.js          # Popup logic (fold map, stats, CSV)
src/content.js        # Content script: folds/unfolds messages on the page
styles.css            # Styles injected into the page (hidden class, on-page button)
_locales/en|vi        # Extension name + description for Chrome
fonts/                # Plus Jakarta Sans + JetBrains Mono (OFL), bundled
icons/                # 16/48/128 icons
DESIGN.md             # Design system reference for the current UI
STITCH-PROMPT.md      # Prompts used to explore the UI design
```

## Technical notes

- Fonts are **bundled in `fonts/`** because MV3 extensions cannot load fonts from a CDN.
- No third-party libraries — all CSS and JS is hand-written.
- A fold holds a fixed 50 messages (`FOLD_SIZE` in `src/content.js`).
- Folded messages are hidden with `display: none`; nothing is deleted from the page or the thread.

## License

MIT — see [LICENSE](LICENSE).
