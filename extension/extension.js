/**
 * Reader Mode Browser Extension
 * extension.js - Helper functions for the extension
 */

// This file provides helper functions for the extension
// It's used by popup.js to simulate clicking the extension icon

// Function to toggle reader mode
function toggleReaderMode() {
  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const currentTab = tabs[0];
      
      // Don't run on chrome:// pages, new tab page, etc.
      if (!currentTab.url.startsWith('http')) {
        return;
      }
      
      // Check if we're already in reader mode
      chrome.storage.session.get(['readerModeActive_' + currentTab.id], (data) => {
        const isReaderMode = data['readerModeActive_' + currentTab.id];
        
        if (isReaderMode) {
          // If already in reader mode, go back to original page
          chrome.storage.session.get(['extractedContent_' + currentTab.id], (contentData) => {
            const content = contentData['extractedContent_' + currentTab.id];
            if (content && content.url) {
              chrome.tabs.update(currentTab.id, { url: content.url });
            }
            chrome.storage.session.remove('readerModeActive_' + currentTab.id);
          });
        } else {
          // Execute content script to extract content
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            function: function() {
              // This function will be injected into the page
              try {
                // Create a message to send to the content script
                chrome.runtime.sendMessage({ action: 'extractContent' }, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    return;
                  }
                  
                  if (response && response.success) {
                    // Store the extracted content
                    chrome.storage.session.set({
                      ['extractedContent_' + currentTab.id]: response.article,
                      ['readerModeActive_' + currentTab.id]: true
                    }, () => {
                      // Open reader page
                      chrome.tabs.update(currentTab.id, { url: chrome.runtime.getURL('reader/reader.html') });
                    });
                  } else {
                    console.error('Error extracting content:', response ? response.error : 'Unknown error');
                  }
                });
              } catch (error) {
                console.error('Error in content script:', error);
              }
            }
          });
        }
      });
    }
  });
}
