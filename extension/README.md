# Read Aloud: Intelligent Reader Mode Extension

This directory contains the browser extension part of the Read Aloud project. The extension provides a distraction-free reading experience with text-to-speech functionality and word highlighting.

## Features

- **Reader Mode**: Extracts the main content of a webpage and displays it in a clean, distraction-free format
- **Text-to-Speech**: Reads the content aloud with adjustable speed and voice selection
- **Word Highlighting**: Highlights words as they are being read
- **Floating Controls**: Provides a draggable control panel for the text-to-speech functionality
- **Theme Toggle**: Switch between light and dark themes
- **Font Customization**: Adjust font size and family

## Files

- `manifest.json`: Extension manifest file (Manifest V3)
- `background.js`: Background script for handling extension events
- `content.js`: Content script for interacting with webpages
- `popup.html` & `popup.js`: Extension popup UI and functionality
- `styles.css`: Styles for the extension
- `reader/`: Directory containing reader mode files
  - `reader.html`: Reader mode HTML template
  - `reader.css`: Styles for reader mode
  - `reader.js`: Reader mode functionality

## Installation

1. Load the extension in developer mode:
   - Chrome/Edge: Go to `chrome://extensions/` or `edge://extensions/`, enable "Developer mode", click "Load unpacked", and select this directory
   - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in this directory

2. Make sure the backend server is running (see the backend directory for instructions)

## Usage

- Click the extension icon to activate reader mode on the current page
- Use the toolbar to adjust font size, toggle theme, and start text-to-speech
- Use the floating controls to play/pause, stop, adjust speed, and select voice for text-to-speech
- Right-click on selected text to read it aloud

## Configuration

- The extension settings can be configured through the popup UI
- Settings are stored in the browser's local storage
- The backend URL can be configured in the settings (default: `http://localhost:3000`)
