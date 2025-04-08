/**
 * Reader Mode Browser Extension
 * reader.js - Injects extracted content, handles UI toggles
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab ID
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0].id;
  
  // Load user preferences
  loadUserPreferences();
  
  // Get extracted content from storage
  const data = await chrome.storage.session.get(['extractedContent_' + tabId]);
  const extractedContent = data['extractedContent_' + tabId];
  
  if (extractedContent) {
    displayContent(extractedContent);
  } else {
    displayError('No content available. Please try again.');
  }
  
  // Set up event listeners for UI controls
  setupEventListeners(tabId);
});

/**
 * Display the extracted content in the reader view
 * @param {Object} content - The extracted content object
 */
function displayContent(content) {
  // Set the page title
  document.title = content.title || 'Reader Mode';
  
  // Set the article title
  const titleElement = document.getElementById('article-title');
  titleElement.textContent = content.title || 'Untitled Article';
  
  // Set the byline if available
  const bylineElement = document.getElementById('article-byline');
  if (content.byline) {
    bylineElement.textContent = content.byline;
    bylineElement.classList.remove('hidden');
  } else {
    bylineElement.classList.add('hidden');
  }
  
  // Set the article content
  const contentElement = document.getElementById('article-content');
  contentElement.innerHTML = content.content || '<p>No content available.</p>';
  
  // Set the original URL link
  const urlElement = document.getElementById('original-url');
  if (content.url) {
    urlElement.href = content.url;
  }
  
  // Clean up the content
  sanitizeContent(contentElement);
}

/**
 * Sanitize the content to ensure it's safe and clean
 * @param {HTMLElement} contentElement - The element containing the article content
 */
function sanitizeContent(contentElement) {
  // Remove potentially harmful elements
  const elementsToRemove = contentElement.querySelectorAll('script, iframe, object, embed, form');
  elementsToRemove.forEach(element => element.remove());
  
  // Make all links open in a new tab
  const links = contentElement.querySelectorAll('a');
  links.forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  
  // Ensure all images have alt text
  const images = contentElement.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      img.setAttribute('alt', 'Image');
    }
  });
}

/**
 * Display an error message
 * @param {string} message - The error message to display
 */
function displayError(message) {
  document.getElementById('article-title').textContent = 'Error';
  document.getElementById('article-byline').classList.add('hidden');
  document.getElementById('article-content').innerHTML = `<p>${message}</p>`;
}

/**
 * Set up event listeners for UI controls
 * @param {number} tabId - The ID of the current tab
 */
function setupEventListeners(tabId) {
  // Back button
  document.getElementById('back-button').addEventListener('click', async () => {
    const data = await chrome.storage.session.get(['extractedContent_' + tabId]);
    const content = data['extractedContent_' + tabId];
    
    if (content && content.url) {
      chrome.tabs.update({ url: content.url });
    } else {
      // If we don't have the original URL, just go back in history
      window.history.back();
    }
  });
  
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const body = document.body;
    const lightIcon = document.getElementById('light-icon');
    const darkIcon = document.getElementById('dark-icon');
    
    if (body.classList.contains('light-mode')) {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      lightIcon.classList.add('hidden');
      darkIcon.classList.remove('hidden');
      saveUserPreference('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
      saveUserPreference('theme', 'light');
    }
  });
  
  // Font family selector
  document.getElementById('font-family').addEventListener('change', (e) => {
    document.body.style.fontFamily = e.target.value;
    saveUserPreference('fontFamily', e.target.value);
  });
  
  // Font size controls
  const contentElement = document.getElementById('article-content');
  let currentFontSize = 3; // Default (18px)
  
  document.getElementById('font-size-decrease').addEventListener('click', () => {
    if (currentFontSize > 1) {
      currentFontSize--;
      updateFontSize();
    }
  });
  
  document.getElementById('font-size-increase').addEventListener('click', () => {
    if (currentFontSize < 7) {
      currentFontSize++;
      updateFontSize();
    }
  });
  
  function updateFontSize() {
    // Remove all font size classes
    for (let i = 1; i <= 7; i++) {
      contentElement.classList.remove(`font-size-${i}`);
    }
    
    // Add the current font size class
    contentElement.classList.add(`font-size-${currentFontSize}`);
    saveUserPreference('fontSize', currentFontSize);
  }
}

/**
 * Save user preference to storage
 * @param {string} key - The preference key
 * @param {any} value - The preference value
 */
function saveUserPreference(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

/**
 * Load user preferences from storage
 */
async function loadUserPreferences() {
  const preferences = await chrome.storage.sync.get(['theme', 'fontFamily', 'fontSize']);
  
  // Apply theme preference
  if (preferences.theme === 'dark') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    document.getElementById('light-icon').classList.add('hidden');
    document.getElementById('dark-icon').classList.remove('hidden');
  }
  
  // Apply font family preference
  if (preferences.fontFamily) {
    document.body.style.fontFamily = preferences.fontFamily;
    document.getElementById('font-family').value = preferences.fontFamily;
  }
  
  // Apply font size preference
  if (preferences.fontSize) {
    const contentElement = document.getElementById('article-content');
    
    // Remove all font size classes
    for (let i = 1; i <= 7; i++) {
      contentElement.classList.remove(`font-size-${i}`);
    }
    
    // Add the saved font size class
    contentElement.classList.add(`font-size-${preferences.fontSize}`);
  }
}
