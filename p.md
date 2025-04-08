
# 📄 Product Requirements Document (PRD)

## 🧠 Project Title
**Read Aloud: Intelligent Reader Mode with Word Highlighting**

---

## 📝 Overview
This project is a **cross-browser extension** (Chrome, Edge, Firefox) that reads web pages aloud using **Text-to-Speech (TTS)** and highlights words in real time as they are spoken. The extension enters a custom **Reader Mode** by extracting the main article text using **Gemini 2.0 Flash Lite**, ensuring a distraction-free reading experience. A floating control bar provides playback and customization options.

---

## 🎯 Goals

- Improve accessibility for users with reading difficulties or visual impairments.
- Provide a seamless read-aloud experience for articles, blog posts, and documentation.
- Enable users to listen to selected content hands-free with visual feedback.

---

## 📦 Tech Stack

### ✅ Frontend (Browser Extension)
- **Manifest V3**
- **HTML + CSS + JavaScript**
- **Cross-browser support:** Chrome, Edge, Firefox

### ✅ Backend
- **Node.js + Express.js**
- **Gemini 2.0 Flash Lite API** for extracting the main article text

### ✅ Machine Learning
- **Gemini 2.0 Flash Lite**: Main content extraction (like Reader Mode)

---

## 🗂 Project Structure

```
project-root/
│
├── extension/        # Frontend code for the browser extension
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   ├── styles.css
│   └── manifest.json
│
└── backend/          # Express.js backend
    ├── server.js
    ├── routes/
    │   └── extract.js
    └── services/
        └── gemini.js
```

---

## 🌟 Features

### 🔊 Core Functionality
- **Reader Mode with Main Content Extraction**
  - Extracts primary content using Gemini 2.0 Flash Lite via backend
  - Displays a clean, distraction-free reading interface

- **Text-to-Speech (TTS)**
  - Reads extracted or selected content aloud
  - Supports system voices with adjustable pitch and rate

- **Word-by-Word Highlighting**
  - Syncs TTS with word highlighting
  - Uses `range.getBoundingClientRect()` for precise positioning

### 🎛️ User Experience
- **Floating Control Bar**
  - Play/Pause button
  - Speed control (0.5x to 4x)
  - Voice and pitch selection
  - Always visible, draggable UI

- **Smart Scrolling**
  - Auto-scrolls to match the word being read aloud

- **Context Menu Integration**
  - Right-click on selected text to trigger read-aloud functionality

- **Read from Selection**
  - Users can select any part of the webpage and right-click to read aloud

- **Offline Mode (Optional/Future)**
  - Use built-in browser TTS for offline support

---

## 🔐 Permissions (manifest.json)

```json
"permissions": [
  "contextMenus",
  "activeTab",
  "scripting",
  "storage"
],
"host_permissions": [
  "<all_urls>"
],
"background": {
  "service_worker": "background.js"
}
```

---

## 🔄 Backend API Endpoints

### `POST /extract`
Extracts main readable content from a given URL using Gemini 2.0 Flash Lite.

#### Request Body:
```json
{
  "url": "https://example.com/article"
}
```

#### Response:
```json
{
  "title": "Article Title",
  "content": "Main readable content..."
}
```

---

## 🧪 Testing

- Compatibility tested across Chrome, Edge, Firefox
- Responsive design for floating control bar
- Performance tested for large pages
- Accessibility audits (screen reader & keyboard navigation)

---

## 📅 Timeline

| Phase                | Duration     |
|---------------------|--------------|
| Requirements & Design | 3 days       |
| Frontend Extension Dev | 7 days       |
| Backend API & Gemini Integration | 4 days       |
| TTS + Word Highlighting | 4 days       |
| Testing & Debugging  | 3 days       |
| Deployment & Packaging | 2 days       |

---

## 🚀 other Enhancements

- Language detection and multilingual TTS
- Dark mode and accessibility themes
- Save-for-later reading queue
- Offline text caching
- User analytics dashboard
