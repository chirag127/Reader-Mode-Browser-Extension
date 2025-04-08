# Reader Mode Browser Extension

A lightweight browser extension that enables a distraction-free, reader-friendly view of any webpage. It supports Chrome, Edge, Firefox, and other modern browsers that support Manifest V3.

## Features

-   **Clean Reading UI**: Displays only main content (title, article text, images)
-   **Light/Dark Mode**: Toggle between light and dark themes
-   **Font Customization**: Adjustable font family and size for better readability
-   **Page Navigation**: Preserves links within content
-   **Back to Original**: Button to return to the original webpage

## Installation

### Chrome / Edge

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Reader Mode icon should appear in your browser toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the extension directory
5. The Reader Mode icon should appear in your browser toolbar

## Usage

1. Navigate to any article or content-heavy webpage
2. Click the Reader Mode icon in your browser toolbar
3. The page will be transformed into a clean, reader-friendly format
4. Use the controls at the top to:
    - Toggle between light and dark mode
    - Change font family and size
    - Return to the original page

## How It Works

The extension uses content extraction algorithms to identify and extract the main content of a webpage, removing distractions like ads, sidebars, and navigation elements. It then presents this content in a clean, customizable format optimized for reading.

## Development

### Project Structure

```
extension/
├── icons/                   # Extension icons
├── reader/                  # Reader mode UI
│   ├── reader.html          # Reader page template
│   ├── reader.css           # Styles for reader mode
│   └── reader.js            # Reader functionality
├── background.js            # Background script for extension
├── content.js               # Content script for extraction
├── manifest.json            # Extension manifest
├── popup.html               # Popup UI
└── popup.js                 # Popup functionality
```

### Building

This extension is built with vanilla JavaScript, HTML, and CSS, so no build step is required. Simply make your changes to the source files.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
