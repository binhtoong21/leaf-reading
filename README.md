# Leaf — a personal reading notebook

[![CI](https://github.com/binhtoong21/leaf-reading/actions/workflows/ci.yml/badge.svg)](https://github.com/binhtoong21/leaf-reading/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/binhtoong21/leaf-reading)](https://github.com/binhtoong21/leaf-reading/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Leaf is a quiet place to read English texts and keep what you learn from them. Paste a passage, highlight words,
phrases and grammar, write the meaning in your own words, then review them later as flashcards — always with the
sentence they came from. It was built for Vietnamese learners preparing for TOEIC, so **the interface and the AI
explanations are in Vietnamese**.

Everything stays on your computer: no account, no cloud, one local SQLite file.

![Library](docs/screenshots/library.png)
![Reader with margin notes](docs/screenshots/reader.png)

## Features

- **Library** of reading passages with tags, source and reading progress.
- **Reader** with colour-coded highlights (vocabulary, phrase, grammar, note), margin notes, focus mode and adjustable
  font size.
- **Notebook** to search everything you saved and jump back to the original context.
- **Review** with flashcards that hide the meaning and show the sentence; a simple spaced-repetition schedule.
- **AI lookup (optional)**: select a word or phrase and get its meaning in context, pronunciation, word family,
  examples and look-alike words, then save it as a note after editing. Works with any OpenAI-compatible API
  (Gemini, OpenRouter, Ollama…).
- **Backup / restore** the whole library as one JSON file.

## Install (Windows)

1. Download `Leaf-Setup-<version>.exe` from the [latest release](https://github.com/binhtoong21/leaf-reading/releases/latest).
2. Run it. Windows SmartScreen may warn that the app is unrecognised because the installer is not code-signed:
   click **More info → Run anyway**.
3. Leaf installs for the current user and adds **Leaf** shortcuts to the Desktop and the Start menu. Uninstall it
   from *Settings → Apps*.

The desktop app keeps its data in `%APPDATA%\Leaf\leaf.sqlite`. Uninstalling does not delete it.

## Run from source

Requires [Node.js](https://nodejs.org/) **22.13 or newer** (Node 24 LTS recommended). Node 22 may print an
"SQLite is experimental" warning; it is harmless. On Windows, use `npm.cmd` so PowerShell does not block `npm.ps1`.

```powershell
git clone https://github.com/binhtoong21/leaf-reading.git
cd leaf-reading
npm.cmd install
```

| Command | What it does |
|---|---|
| `npm.cmd run dev` | Development: API on port 4318 + Vite on **http://127.0.0.1:5173** with hot reload |
| `npm.cmd run build` then `npm.cmd start` | Production build served on **http://127.0.0.1:4318** |
| `npm.cmd run app` | Build and open the desktop window without installing |
| `npm.cmd run dist` | Build the Windows installer into `release/` |
| `npm.cmd test` | Run the tests |

The browser version stores data in `data/leaf.sqlite` inside the project folder, separate from the desktop app.
The desktop app and the browser version both use port 4318, so run only one at a time.
To move data between them, use **Backup** in one and **Restore** in the other.

## AI lookup (optional)

Leaf calls any provider that supports the OpenAI `/chat/completions` format. Configuration lives in a `.env` file:

- desktop app: `%APPDATA%\Leaf\.env`
- from source: `.env` in the project folder (copy it from `.env.example`)

Example for Google Gemini (free API key from [aistudio.google.com](https://aistudio.google.com)):

```
LOOKUP_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LOOKUP_API_KEY=<your key>
LOOKUP_MODEL=gemini-3.5-flash-lite
LOOKUP_FALLBACK_MODELS=gemini-3.1-flash-lite
```

Restart Leaf after editing `.env`. All options are documented in [`.env.example`](.env.example).

- The key stays in `.env` on your machine. It is never sent to the page and never included in backups.
- Only the selected text (up to 200 characters) and the sentence around it are sent to the provider, never the whole
  passage. Free tiers (e.g. Gemini) may use submitted text to improve their products, so do not look up words in
  private documents.
- Results are cached locally (up to 2,000 entries), so looking up the same spot again is free and works offline.
- When the main model is overloaded (503) or out of quota (429), Leaf switches to `LOOKUP_FALLBACK_MODELS`.
  Total waiting time is capped at 20 seconds.
- At most `LOOKUP_DAILY_LIMIT` AI calls per day (default 100).
- AI output can be wrong: you always review and edit it before saving.

Without configuration, the lookup button explains that AI is not set up and offers a manual note instead.

## How to use

1. **Add a passage**: paste the text and give it a title, source and tags. A sample passage is included.
2. **Highlight**: select a word or sentence, choose **Ghi chú & highlight** (note & highlight), pick a type and write
   your own explanation. Or choose **Tra từ** (look up) to ask the AI, then save the prefilled note after editing.
3. Click a highlight or a margin note to edit or delete it. Highlights cannot overlap. Once a passage has highlights
   its text is locked so positions stay correct; title, source and tags remain editable.
4. **Notebook** (Sổ kiến thức) searches terms, meanings and notes and links back to the passage.
5. **Review** (Ôn tập) shows due cards with their context. *Again* → 10 minutes; *Hard* → at least 1 day;
   *Good* → at least 1 day, then ×2.5; *Easy* → at least 4 days, then ×4; capped at 365 days. Plain notes are not
   reviewed.
6. **Backup** (Sao lưu) exports JSON; **Restore** (Khôi phục) replaces the whole library after confirmation.

## Data, privacy and limits

- The server listens on `127.0.0.1` only and checks Host/Origin headers; the lookup API also needs a per-run token.
  It is not designed for internet deployment or multiple users.
- Data is not encrypted; it is protected by your Windows account.
- Plain-text import only: no PDF extraction, OCR or web scraping.
- Requests are limited to 12 MB; a passage is limited to 500,000 characters and 30 tags of up to 80 characters.
- The library is stored as one validated snapshot row in SQLite, which suits a personal library.

## Project structure

```text
src/                React UI (components, features, lib)
server/
  index.mjs         Local HTTP API and static file server (startServer)
  store.mjs         SQLite storage, validation, review schedule
  lookup.mjs        AI lookup: prompt, provider call, retry/fallback, cache, daily cap
  dev.mjs           Starts the API and Vite together
electron/main.mjs   Desktop shell: starts the server in-process and opens the window
build/              App icon (edit icon.svg, then run `npm.cmd run icon`)
tests/              Node test runner tests
docs/               Product notes (Vietnamese) and screenshots
```

## Releasing

Pushing a tag `v<version>` that matches `version` in `package.json` builds the Windows installer on GitHub Actions
and publishes it as a GitHub Release:

```powershell
npm.cmd version patch   # bumps package.json and creates the tag, e.g. v1.0.1
git push origin main --follow-tags
```

## License

[MIT](LICENSE)
