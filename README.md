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
4. Click "Load unpacked" and select the `extension` folder from this repository
5. The Reader Mode extension should now appear in your browser toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `extension` folder from this repository
5. The Reader Mode extension should now appear in your browser toolbar

## Usage

1. Navigate to any article or content-heavy webpage
2. Click the Reader Mode icon in your browser toolbar or click the "Enable Reader Mode" button in the popup
3. The page will be transformed into a clean, reader-friendly format
4. Use the controls at the top to:
    - Toggle between light and dark mode
    - Change font family and size
    - Return to the original page

## How It Works

The extension uses Mozilla's Readability.js algorithm to identify and extract the main content of a webpage, removing distractions like ads, sidebars, and navigation elements. It then presents this content in a clean, customizable format optimized for reading.

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
├── extension.js             # Helper functions
├── manifest.json            # Extension manifest
├── popup.html               # Popup UI
└── popup.js                 # Popup functionality
```

### Key Components

1. **Background Script** (`background.js`): Manages the extension's state and handles communication between components
2. **Content Script** (`content.js`): Extracts content from webpages using Readability.js
3. **Reader UI** (`reader/`): Presents the extracted content in a clean, customizable format
4. **Popup UI** (`popup.html`, `popup.js`): Provides a simple interface for enabling reader mode
5. **Helper Functions** (`extension.js`): Shared functionality used by multiple components

### Testing

A test page is provided in the `test` directory to help verify the extension's functionality:

1. Open `test/test_article.html` in your browser
2. Click the Reader Mode icon or button
3. Verify that the article content is properly extracted and displayed in reader mode

### Building

This extension is built with vanilla JavaScript, HTML, and CSS, so no build step is required. Simply make your changes to the source files.

## Browser Compatibility

The extension is designed to work with:

-   Google Chrome (v88+)
-   Microsoft Edge (v88+)
-   Mozilla Firefox (v109+)

## Future Enhancements

Potential future enhancements include:

1. **Text-to-Speech**: Read aloud content using Web Speech API
2. **Reading List**: Save content for offline reading
3. **Scroll Progress Indicator**: Show reading progress
4. **Highlighting & Notes**: Allow users to highlight text and take notes
5. **Custom Themes**: Additional theme options beyond light/dark

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

-   [Mozilla's Readability.js](https://github.com/mozilla/readability) - Content extraction algorithm
-   [Google Fonts](https://fonts.google.com/) - Web fonts used in the reader UI
