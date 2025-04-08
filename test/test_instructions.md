# Read Aloud: Intelligent Reader Mode Testing Instructions

This document provides instructions for testing the Read Aloud: Intelligent Reader Mode Browser Extension with text-to-speech functionality.

## Setup

1. Load the extension in your browser:

    - **Chrome/Edge**: Go to `chrome://extensions/` or `edge://extensions/`, enable Developer mode, click "Load unpacked", and select the extension directory.
    - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the extension directory.

2. Start the backend server:

    - Navigate to the `backend` directory
    - Run `npm install` to install dependencies
    - Run `npm start` to start the server
    - Ensure the server is running on http://localhost:3000

3. Open the test page:
    - Open the `test/test_article.html` file in your browser.

## Test Cases

### 1. Basic Functionality

-   **Test**: Click the Reader Mode icon in the toolbar.
-   **Expected**: The page should transform into a clean, reader-friendly format with only the main article content visible.
-   **Verify**:
    -   The article title "The Future of Artificial Intelligence" is displayed.
    -   The author information "By John Smith | Published: April 8, 2025" is displayed.
    -   The main article text is displayed.
    -   Advertisements, navigation, sidebar, and footer are removed.

### 2. Theme Toggle

-   **Test**: Click the theme toggle button (sun/moon icon) in the reader mode.
-   **Expected**: The page should switch between light and dark themes.
-   **Verify**:
    -   Light theme has a white background with dark text.
    -   Dark theme has a dark background with light text.
    -   The theme toggle icon changes accordingly.

### 3. Font Customization

-   **Test**: Change the font family using the dropdown menu.
-   **Expected**: The text should display in the selected font.
-   **Verify**: Text appearance changes according to the selected font.

-   **Test**: Click the A+ and A- buttons to adjust font size.
-   **Expected**: The text size should increase or decrease accordingly.
-   **Verify**: Text size changes when buttons are clicked.

### 4. Text-to-Speech Functionality

-   **Test**: Click the "Read Aloud" button in reader mode.
-   **Expected**: The text should be read aloud with word highlighting.
-   **Verify**:
    -   Words are highlighted as they are spoken
    -   The page scrolls automatically to keep the highlighted word in view
    -   The floating controls panel appears with play/pause, stop, speed, and voice selection

### 5. TTS Controls

-   **Test**: Use the play/pause button in the floating controls.
-   **Expected**: The speech should pause and resume accordingly.
-   **Verify**: The speech pauses when the pause button is clicked and resumes when the play button is clicked.

-   **Test**: Change the speech rate using the dropdown.
-   **Expected**: The speech rate should change accordingly.
-   **Verify**: The speech becomes faster or slower based on the selected rate.

-   **Test**: Click the stop button.
-   **Expected**: The speech should stop completely.
-   **Verify**: The speech stops and the highlighting is removed.

### 6. Context Menu Integration

-   **Test**: Select some text on the page, right-click, and select "Read selection aloud".
-   **Expected**: The selected text should be read aloud with word highlighting.
-   **Verify**: The selected text is read aloud with proper highlighting.

### 7. Back to Original

-   **Test**: Click the close button (✕) in the reader mode.
-   **Expected**: The page should return to the original format.
-   **Verify**: All original page elements (header, navigation, sidebar, ads, footer) are visible again.

### 8. Persistence

-   **Test**: Set preferences (theme, font, size, speech rate, voice), then navigate away and return to reader mode.
-   **Expected**: Your preferences should be remembered.
-   **Verify**: The reader mode appears with your previously selected settings, including TTS settings.

## Reporting Issues

If you encounter any issues during testing, please document:

1. The test case that failed
2. The expected behavior
3. The actual behavior
4. Any error messages (check the browser console)
5. Browser name and version

## Additional Notes

-   The extension uses Gemini 2.0 Flash Lite for content extraction, which may work differently on various types of web pages.
-   Some complex web pages might not render perfectly in reader mode.
-   JavaScript-heavy pages might have limited functionality in reader mode.
-   Text-to-speech functionality relies on the Web Speech API, which may have different voices available depending on the browser and operating system.
-   The backend server must be running for the Gemini-powered content extraction to work. If the server is not running, the extension will fall back to basic content extraction.
