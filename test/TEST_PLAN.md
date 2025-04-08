# Reader Mode Browser Extension Test Plan

This document outlines the test plan for the Reader Mode Browser Extension. It provides a structured approach to verify that all features work as expected across different browsers.

## Prerequisites

- Chrome, Edge, or Firefox browser
- The Reader Mode Browser Extension loaded in developer mode

## Test Environment Setup

1. Load the extension in your browser:
   - **Chrome/Edge**: Go to `chrome://extensions/` or `edge://extensions/`, enable Developer mode, click "Load unpacked", and select the `extension` directory.
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `extension` directory.

2. Open the test page:
   - Open the `test/test.html` file in your browser.

## Test Cases

### 1. Installation and Basic Functionality

| Test ID | Test Description | Steps | Expected Result | Status |
|---------|-----------------|-------|-----------------|--------|
| 1.1 | Extension loads correctly | Load the extension in developer mode | Extension icon appears in the toolbar | |
| 1.2 | Popup displays correctly | Click the extension icon | Popup shows with "Enable Reader Mode" button and information text | |
| 1.3 | Reader mode activation from popup | Click "Enable Reader Mode" button in popup | Page transforms into reader mode with clean layout | |
| 1.4 | Reader mode activation from icon | Click the extension icon directly (not the popup) | Page transforms into reader mode with clean layout | |

### 2. Content Extraction

| Test ID | Test Description | Steps | Expected Result | Status |
|---------|-----------------|-------|-----------------|--------|
| 2.1 | Article title extraction | Enable reader mode on test page | "The Future of Artificial Intelligence" title is displayed | |
| 2.2 | Author information extraction | Enable reader mode on test page | "By John Smith \| Published: April 8, 2025" is displayed | |
| 2.3 | Main content extraction | Enable reader mode on test page | Article paragraphs are displayed without ads | |
| 2.4 | Distraction removal | Enable reader mode on test page | Navigation, sidebar, ads, and footer are removed | |

### 3. Reader Mode UI Features

| Test ID | Test Description | Steps | Expected Result | Status |
|---------|-----------------|-------|-----------------|--------|
| 3.1 | Light/dark mode toggle | Click the theme toggle button (sun/moon icon) | UI switches between light and dark themes | |
| 3.2 | Font family selection | Select different fonts from the dropdown | Text displays in the selected font | |
| 3.3 | Font size increase | Click the A+ button | Text size increases | |
| 3.4 | Font size decrease | Click the A- button | Text size decreases | |
| 3.5 | Return to original page | Click the back button (arrow icon) | Returns to the original page with all elements | |

### 4. Persistence and State Management

| Test ID | Test Description | Steps | Expected Result | Status |
|---------|-----------------|-------|-----------------|--------|
| 4.1 | Theme preference persistence | 1. Set theme to dark<br>2. Exit reader mode<br>3. Re-enable reader mode | Dark theme is remembered | |
| 4.2 | Font preference persistence | 1. Change font<br>2. Exit reader mode<br>3. Re-enable reader mode | Font selection is remembered | |
| 4.3 | Font size persistence | 1. Change font size<br>2. Exit reader mode<br>3. Re-enable reader mode | Font size is remembered | |
| 4.4 | Reader mode state in popup | 1. Enable reader mode<br>2. Open popup | Popup shows "Exit Reader Mode" button | |

### 5. Cross-Browser Compatibility

| Test ID | Test Description | Steps | Expected Result | Status |
|---------|-----------------|-------|-----------------|--------|
| 5.1 | Chrome compatibility | Run all tests in Chrome | All tests pass | |
| 5.2 | Edge compatibility | Run all tests in Edge | All tests pass | |
| 5.3 | Firefox compatibility | Run all tests in Firefox | All tests pass | |

### 6. Error Handling

| Test ID | Test Description | Steps | Expected Result | Status |
|---------|-----------------|-------|-----------------|--------|
| 6.1 | Non-article page handling | Enable reader mode on a page without article content | Displays a reasonable fallback or error message | |
| 6.2 | Chrome:// URL handling | Try to enable reader mode on chrome:// URLs | Extension does not attempt to process these URLs | |

## Test Results

| Browser | Version | Pass Rate | Notes |
|---------|---------|-----------|-------|
| Chrome  |         |           |       |
| Edge    |         |           |       |
| Firefox |         |           |       |

## Issues and Observations

Document any issues or observations here:

1. 
2. 
3. 

## Recommendations

Based on the test results, provide recommendations for improvements:

1. 
2. 
3. 
