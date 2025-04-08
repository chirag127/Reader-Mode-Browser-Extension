Here’s a detailed **Product Requirements Document (PRD)** for a **Reader Mode Browser Extension**,

# 📄 Product Requirements Document (PRD)
**Project Title:** Reader Mode Browser Extension
**Version:** 1.0.0
**Author:** chirag singhal
**Date:** 2025-04-08

---

## 📌 Overview
Build a lightweight browser extension that enables a **distraction-free, reader-friendly view** of any webpage. It should support **Chrome, Edge, Firefox**, and ideally be extendable to other modern browsers supporting **Manifest V3**.

---

## 🎯 Goal
- Extract the **main content** (title, article, images) of a webpage.
- Remove all non-essential elements (ads, sidebars, popups).
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
  - (Optional) Safari (via Safari Web Extension Converter)

- **Project Structure:**
  ```
  extension/
  ├── icons/                   # Extension icons (16x16, 32x32, 48x48, 128x128)
  ├── reader/                  # Reader mode UI HTML/CSS/JS
  │   ├── reader.html
  │   ├── reader.css
  │   └── reader.js
  ├── content.js               # Injected into webpages to extract and clean article content
  ├── background.js            # Manages toggle state, context menu, and tabs
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
| Safari       | ⚠️                   | Optional, via WebExtension   |

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

### **AI Coding Agent Execution Guidelines**

#### **General Principles**

1. **Autonomous Execution**:

    - Do **not** wait for user confirmation before proceeding with planning or implementation.
    - Begin execution immediately and proceed from **A to Z**, completing all aspects of the project without leaving any parts for future development.

2. **Code Quality & Best Practices**:

    - Follow **industry-standard coding best practices** (e.g., clean code, modularity, proper error handling, reusable components, security, scalability).
    - Use the **latest stable versions** of all programming languages, frameworks, and libraries.
    - Structure code and files according to modern conventions (e.g., proper naming, separation of concerns, environment configuration).

3. **GitHub Integration**:
    - User’s GitHub username: `chirag127`. Use this identity when initializing or configuring repos or pushing code.

#### **Research & Resources**

4. **Web Search**:

    - Use **web search autonomously** whenever needed to resolve implementation details, debug issues, or understand library updates or documentation.

5. **Tool Usage & Limits**:
    - When invoking tools (e.g., file processors, summarizers, code generators), if the input exceeds tool limitations:
        - **Split the input** into smaller parts.
        - **Invoke the tool multiple times** with each part.
        - **Aggregate the results** into a single, coherent output.
        - If needed, **restructure or rephrase** combined results for logic, readability, and consistency.

#### **Thinking & Strategy**

6. **Sequential Reasoning MCP Server**:

    - Utilize **sequential thinking MCP server** extensively for:
        - Step-by-step planning
        - Breaking down complex workflows
        - Dependency resolution
        - Optimal implementation ordering

7. **No Future TODOs**:

    - Do **not** defer tasks or add future "TODO" notes.
    - Every deliverable should be **fully implemented, functional, and production-ready**.

8. **Documentation**:

    - Provide **comprehensive documentation** for all code, including:
        - Code comments
        - README files
        - API documentation (if applicable)
    - Ensure documentation is clear, concise, and easy to follow.

9. **Hyperbrowser**:

    - Use **Hyperbrowser** for all web-related tasks, including:

        - Web scraping
        - Data extraction
        - API interactions

    - Ensure compliance with web scraping best practices and respect robots.txt.

10. **firecrawler**:
    - Use **firecrawler** for all web crawling tasks, including:
        - Data extraction
        - API interactions
    - Ensure compliance with web crawling best practices and respect robots.txt.
11. **Code Review**:
    - Perform **self-code reviews** before finalizing any code.
    - Ensure code is clean, efficient, and adheres to best practices.
12. **Testing**:
    - Implement **unit tests** and **integration tests** for all code.
    - Ensure all tests pass before finalizing any code.
    - Use modern testing frameworks and libraries.
13. **other**:

-   Always test the project at the end to ensure it doesn't contain errors.
-   Don't create placeholder code unless planning to expand on it later.
-   Code from A to Z rather than just small parts that don't fulfill the user's needs.
-   Keep project files between 300-500 lines where possible.
-   Don't duplicate code; build upon existing implementations.
