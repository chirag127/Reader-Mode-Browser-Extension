# Reader Mode Extension Testing Instructions

This document provides instructions for testing the Reader Mode Browser Extension.

## Setup

1. Load the extension in your browser:
   - **Chrome/Edge**: Go to `chrome://extensions/` or `edge://extensions/`, enable Developer mode, click "Load unpacked", and select the extension directory.
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the extension directory.

2. Open the test page:
   - Open the `test.html` file in your browser.

## Test Cases

### 1. Basic Functionality

- **Test**: Click the Reader Mode icon in the toolbar.
- **Expected**: The page should transform into a clean, reader-friendly format with only the main article content visible.
- **Verify**: 
  - The article title "The Future of Artificial Intelligence" is displayed.
  - The author information "By John Smith | Published: April 8, 2025" is displayed.
  - The main article text is displayed.
  - Advertisements, navigation, sidebar, and footer are removed.

### 2. Theme Toggle

- **Test**: Click the theme toggle button (sun/moon icon) in the reader mode.
- **Expected**: The page should switch between light and dark themes.
- **Verify**:
  - Light theme has a white background with dark text.
  - Dark theme has a dark background with light text.
  - The theme toggle icon changes accordingly.

### 3. Font Customization

- **Test**: Change the font family using the dropdown menu.
- **Expected**: The text should display in the selected font.
- **Verify**: Text appearance changes according to the selected font.

- **Test**: Click the A+ and A- buttons to adjust font size.
- **Expected**: The text size should increase or decrease accordingly.
- **Verify**: Text size changes when buttons are clicked.

### 4. Back to Original

- **Test**: Click the back button (arrow icon) in the reader mode.
- **Expected**: The page should return to the original format.
- **Verify**: All original page elements (header, navigation, sidebar, ads, footer) are visible again.

### 5. Persistence

- **Test**: Set preferences (theme, font, size), then navigate away and return to reader mode.
- **Expected**: Your preferences should be remembered.
- **Verify**: The reader mode appears with your previously selected settings.

## Reporting Issues

If you encounter any issues during testing, please document:
1. The test case that failed
2. The expected behavior
3. The actual behavior
4. Any error messages (check the browser console)
5. Browser name and version

## Additional Notes

- The extension uses content extraction algorithms that may work differently on various types of web pages.
- Some complex web pages might not render perfectly in reader mode.
- JavaScript-heavy pages might have limited functionality in reader mode.
