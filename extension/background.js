/**
 * Read Aloud: Intelligent Reader Mode
 * background.js - Background script for the extension
 */

// Default settings for the extension
const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 18,
  fontFamily: 'Georgia, serif',
  lineHeight: 1.5,
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  backendUrl: 'http://localhost:3000'
};

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.local.get('settings', (data) => {
    if (!data.settings) {
      chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    }
  });

  // Create context menu items
  chrome.contextMenus.create({
    id: 'read-aloud-selection',
    title: 'Read selection aloud',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'read-aloud-page',
    title: 'Read page aloud',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'reader-mode',
    title: 'Open in Reader Mode',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'read-aloud-selection') {
    // Read the selected text aloud
    chrome.tabs.sendMessage(tab.id, {
      action: 'readAloudSelection',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'read-aloud-page') {
    // Read the entire page aloud
    chrome.tabs.sendMessage(tab.id, {
      action: 'readAloudPage'
    });
  } else if (info.menuItemId === 'reader-mode') {
    // Open the page in reader mode
    chrome.tabs.sendMessage(tab.id, {
      action: 'activateReaderMode'
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    // Return the current settings
    chrome.storage.local.get('settings', (data) => {
      sendResponse(data.settings || DEFAULT_SETTINGS);
    });
    return true; // Required for async sendResponse
  } else if (message.action === 'saveSettings') {
    // Save the updated settings
    chrome.storage.local.set({ settings: message.settings }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  } else if (message.action === 'extractContent') {
    // Get the backend URL from settings
    chrome.storage.local.get('settings', async (data) => {
      const settings = data.settings || DEFAULT_SETTINGS;
      const backendUrl = settings.backendUrl || DEFAULT_SETTINGS.backendUrl;
      
      try {
        // Call the backend API to extract content
        const response = await fetch(`${backendUrl}/extract`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: message.url,
            html: message.html
          })
        });

        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }

        const extractedContent = await response.json();
        sendResponse({ success: true, content: extractedContent });
      } catch (error) {
        console.error('Error extracting content:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Failed to extract content' 
        });
      }
    });
    return true; // Required for async sendResponse
  }
});

// Handle browser action click (toolbar icon)
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {
    action: 'activateReaderMode'
  });
});
