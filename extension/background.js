/**
 * Reader Mode Browser Extension
 * background.js - Manages toggle state, context menu, and tabs
 */

// Store the original tab URL to allow returning to it
let originalTabInfo = {};

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  // Don't run on chrome:// pages, new tab page, etc.
  if (!tab.url.startsWith('http')) {
    return;
  }

  try {
    // Check if we're already in reader mode for this tab
    const isReaderMode = await chrome.storage.session.get(['readerModeActive_' + tab.id]);
    
    if (isReaderMode && isReaderMode['readerModeActive_' + tab.id]) {
      // If already in reader mode, go back to original page
      if (originalTabInfo[tab.id]) {
        chrome.tabs.update(tab.id, { url: originalTabInfo[tab.id].url });
        delete originalTabInfo[tab.id];
        await chrome.storage.session.remove('readerModeActive_' + tab.id);
      }
    } else {
      // Store original tab info
      originalTabInfo[tab.id] = { url: tab.url, title: tab.title };
      
      // Execute content script to extract content
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent
      }, async (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          console.error('Error executing script:', chrome.runtime.lastError);
          return;
        }
        
        const extractedContent = results[0].result;
        
        // Store the extracted content in session storage
        await chrome.storage.session.set({
          ['extractedContent_' + tab.id]: extractedContent,
          ['readerModeActive_' + tab.id]: true
        });
        
        // Open reader page in the same tab
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('reader/reader.html') });
      });
    }
  } catch (error) {
    console.error('Error in background script:', error);
  }
});

// Function to extract content from the page
function extractPageContent() {
  // This function will be injected into the page
  try {
    // Use Readability.js to extract content if available
    if (typeof Readability === 'undefined') {
      // If Readability is not available, use a simple extraction method
      const title = document.title || '';
      const content = document.querySelector('article') || 
                     document.querySelector('main') || 
                     document.querySelector('.article') ||
                     document.querySelector('.content') ||
                     document.body;
      
      return {
        title: title,
        content: content ? content.innerHTML : document.body.innerHTML,
        url: window.location.href,
        byline: document.querySelector('meta[name="author"]')?.content || ''
      };
    } else {
      // Use Readability if available
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      return reader.parse();
    }
  } catch (error) {
    console.error('Error extracting content:', error);
    return { 
      title: document.title, 
      content: '<p>Error extracting content. Please try again.</p>',
      url: window.location.href
    };
  }
}

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (originalTabInfo[tabId]) {
    delete originalTabInfo[tabId];
  }
  chrome.storage.session.remove(['extractedContent_' + tabId, 'readerModeActive_' + tabId]);
});
