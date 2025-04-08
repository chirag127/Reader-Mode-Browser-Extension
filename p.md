# 📄 Product Requirements Document (PRD)

## Project Title: Reader Mode Browser Extension
## Version: 1.0.0
## Author: chirag singhal
## Date: 2025-04-08

## Overview

Build a lightweight browser extension that enables a **distraction-free, reader-friendly view** of any webpage. It should support **Chrome, Edge, Firefox**, and ideally be extendable to other modern browsers supporting **Manifest V3**.

## Goals
- Present it in a **clean, readable layout** with adjustable typography and theme (light/dark).
- Allow users to toggle Reader Mode from a toolbar icon.

---

## 🧱 Tech Stack

- **Frontend:**
  - HTML, CSS, Vanilla JavaScript
  - Browser Extension APIs (Manifest V3)

- **Browsers Supported:**
  - Chrome
  - Microsoft Edge
  - Firefox (ensure Manifest V3 compliance)

- **Project Structure:**
  ```
  extension/
  ├── icons/                   # Extension icons (16x16, 48x48, 128x128)
  ├── reader/                  # Reader mode UI HTML/CSS/JS
  │   ├── reader.html
  │   ├── reader.css
  │   └── reader.js
  ├── content.js               # Injected into webpages to extract and clean article content
  ├── background.js            # Manages toggle state, context menu, and tabs
  ├── extension.js             # Helper functions for the extension
  ├── manifest.json            # Manifest V3 file
  └── popup.html               # Minimal popup for enabling reader mode
  ```

---

## 🧩 Features

### ✅ Core Features
| Feature                         | Description                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| Reader Mode Toggle               | Toolbar icon allows user to turn Reader Mode on/off.                       |
| Clean Reading UI                | Displays only main content: title, article text, images.                   |
| Light/Dark Mode                 | User can toggle between light and dark themes.                             |
| Font and Size Options           | Adjustable font family and size for readability.                           |
| Page Navigation                 | Preserves links within content (if not filtered).                          |
| Back to Original Page           | Button to return to original webpage.                                      |

---

### 🔧 Optional Features (Future Enhancements)
| Feature                         | Description                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| Text-to-Speech                  | Button to read aloud content using Web Speech API.                         |
| Save to Reading List            | Save content for offline reading using browser storage.                    |
| Scroll Progress Indicator       | Show scroll progress bar.                                                  |
| Highlighting & Notes            | Allow user to highlight text or take notes.                                |

---

## 🧠 Content Extraction Strategy

- Use DOM parsing via `content.js` to extract:
  - `<article>`, `<main>`, or most content-rich `<div>`
  - Use heuristics and libraries like **Readability.js (from Mozilla)**
- Sanitize HTML to remove ads, scripts, overlays, etc.

---

## 📂 File Descriptions

| File                | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `manifest.json`     | Declares extension, permissions, and background scripts.                |
| `background.js`     | Handles toggle logic, page action, and communicates with `content.js`. |
| `content.js`        | Injected into web pages to extract and sanitize readable content.       |
| `reader/reader.html`| The clean reading page template.                                        |
| `reader/reader.css` | Styles for light/dark mode, fonts, spacing.                            |
| `reader/reader.js`  | Injects extracted content, handles UI toggles.                         |

---

## 🔐 Permissions Needed

```json
"permissions": [
  "activeTab",
  "scripting",
  "storage"
],
"host_permissions": [
  "<all_urls>"
]
```

---

## 🧪 Testing & Browser Compatibility

| Browser      | Manifest V3 Support | Notes                        |
|--------------|---------------------|------------------------------|
| Chrome       | ✅                   | Full support                 |
| Edge         | ✅                   | Same as Chrome               |
| Firefox      | ✅                   | Needs `browser` API shim     |

---

## 🕹️ User Flow

1. User visits a webpage with an article.
2. Clicks on the Reader Mode icon.
3. Extension:
   - Extracts main content.
   - Opens `reader.html` in a new tab with the cleaned content.
4. User can customize font/theme.
5. Option to return to original page.

---

## 🚧 other Plans

- Add keyboard shortcuts.
- Sync reading preferences across devices using `chrome.storage.sync`.
- Allow offline access to saved articles.
