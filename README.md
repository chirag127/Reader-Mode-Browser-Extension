# 📘 Reader Mode Browser Extension

A lightweight browser extension that enables a distraction-free, reader-friendly view of any webpage with text-to-speech capabilities. It supports Chrome, Edge, Firefox, and other modern browsers that support Manifest V3.

![Reader Mode Banner](extension/icons/icon128.png)

## ✨ Description

Reader Mode is a browser extension designed to transform cluttered web pages into clean, distraction-free reading experiences. It removes ads, sidebars, popups, and other distracting elements, allowing you to focus solely on the content that matters.

The extension also includes a powerful text-to-speech feature with word highlighting, adjustable speed, and customizable voices, making web content more accessible and convenient to consume.

## 🚀 Live Demo

Visit our [GitHub Pages website](https://chirag127.github.io/Reader-Mode-Browser-Extension/) to learn more about the extension and see it in action.

## 🛠️ Tech Stack / Tools Used

### Frontend (Extension)

-   HTML5, CSS3, JavaScript (Vanilla)
-   Chrome Extension API
-   Firefox WebExtension API
-   Manifest V3
-   Mozilla's Readability.js (fallback)
-   Web Speech API

### Backend

-   Node.js
-   Express.js
-   Google Generative AI API (Gemini 2.0 Flash Lite)
-   CORS for cross-origin requests

## 🧪 Features

-   **AI-Powered Content Extraction**: Uses Google's Gemini 2.0 Flash Lite model for superior content extraction
-   **Clean Reading UI**: Displays only main content (title, article text, images)
-   **Light/Dark Mode**: Toggle between light and dark themes
-   **Font Customization**: Adjustable font family and size for better readability
-   **Page Navigation**: Preserves links within content
-   **Back to Original**: Button to return to the original webpage
-   **Text-to-Speech**: Read aloud content with word highlighting
-   **Adjustable Speed**: Customize reading speed up to 4x
-   **Floating Control Bar**: Easy access to play, pause, and settings controls
-   **Read from Selection**: Start reading from any selected text on the page
-   **Context Menu Integration**: Right-click on selected text to start reading
-   **Smart Scrolling**: Automatically scrolls to keep the current text in view
-   **Customizable Voice**: Choose from available system voices and adjust pitch
-   **Fallback Mechanisms**: Gracefully falls back to Readability.js when AI extraction is unavailable

## 💾 Installation Instructions

### Backend Setup

1. Navigate to the backend directory:
    ```
    cd backend
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Create a `.env` file based on the `.env.example` file:
    ```
    cp .env.example .env
    ```
4. Add your Google AI API key to the `.env` file:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
5. Start the backend server:
    ```
    npm start
    ```

### Extension Setup

#### Chrome / Edge

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `extension` folder from this repository
5. The Reader Mode extension should now appear in your browser toolbar

#### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `extension` folder from this repository
5. The Reader Mode extension should now appear in your browser toolbar

### Configuration

If you need to change the backend URL or disable Gemini extraction, you can modify the `config.js` file in the extension directory.

## 🔧 Usage

### Basic Usage

1. Navigate to any article or content-heavy webpage
2. Click the Reader Mode icon in your browser toolbar or click the "Enable Reader Mode" button in the popup
3. The page will be transformed into a clean, reader-friendly format
4. Use the controls at the top to:
    - Toggle between light and dark mode
    - Change font family and size
    - Return to the original page

### Text-to-Speech Feature

1. Click the speaker icon in the reader controls to start reading the article
2. Use the floating control bar to:
    - Play/Pause: Control the reading playback
    - Stop: Stop reading completely
    - Speed: Adjust the reading speed from 0.5x to 4x
    - Voice: Select from available system voices
    - Pitch: Adjust the pitch of the voice
3. Alternatively, select any text and right-click to choose "Read selection aloud"

## 🧠 How It Works

The extension uses Google's Gemini 2.0 Flash Lite AI model to identify and extract the main content of a webpage, removing distractions like ads, sidebars, and navigation elements. It then presents this content in a clean, customizable format optimized for reading.

As a fallback mechanism, the extension also includes Mozilla's Readability.js algorithm for content extraction when the Gemini API is unavailable or for offline use.

## 📸 Screenshots

![Reader Mode Light Theme](https://via.placeholder.com/800x450.png?text=Reader+Mode+Light+Theme)
![Reader Mode Dark Theme](https://via.placeholder.com/800x450.png?text=Reader+Mode+Dark+Theme)
![Text-to-Speech Feature](https://via.placeholder.com/800x450.png?text=Text-to-Speech+Feature)

## 💻 Development

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

## 📱 Browser Compatibility

The extension is designed to work with:

-   Google Chrome (v88+)
-   Microsoft Edge (v88+)
-   Mozilla Firefox (v109+)

## 💡 Future Enhancements

Potential future enhancements include:

1. **Reading List**: Save content for offline reading
2. **Scroll Progress Indicator**: Show reading progress
3. **Highlighting & Notes**: Allow users to highlight text and take notes
4. **Custom Themes**: Additional theme options beyond light/dark
5. **Translation**: Integrate with translation services to read content in different languages
6. **Voice Commands**: Control the reader mode using voice commands

## 👋 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## 🌟 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Credits

-   [Mozilla's Readability.js](https://github.com/mozilla/readability) - Content extraction algorithm
-   [Google Fonts](https://fonts.google.com/) - Web fonts used in the reader UI
-   [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Text-to-speech functionality
