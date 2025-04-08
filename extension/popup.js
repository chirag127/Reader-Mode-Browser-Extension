/**
 * Read Aloud: Intelligent Reader Mode
 * popup.js - Script for the extension popup
 */

// Default settings
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

// DOM elements
const activateReaderModeButton = document.getElementById('activate-reader-mode');
const readPageButton = document.getElementById('read-page');
const fontFamilySelect = document.getElementById('font-family');
const fontSizeInput = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const speechRateSelect = document.getElementById('speech-rate');
const backendUrlInput = document.getElementById('backend-url');
const themeToggleButton = document.getElementById('theme-toggle');

// Initialize popup
function initializePopup() {
  // Load settings
  chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
    // Apply settings to UI
    applySettings(settings || DEFAULT_SETTINGS);
  });
  
  // Set up event listeners
  setupEventListeners();
}

// Apply settings to UI
function applySettings(settings) {
  // Apply theme
  document.body.className = settings.theme === 'dark' ? 'dark-theme' : 'light-theme';
  themeToggleButton.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
  
  // Apply font settings
  fontFamilySelect.value = settings.fontFamily;
  fontSizeInput.value = settings.fontSize;
  fontSizeValue.textContent = `${settings.fontSize}px`;
  
  // Apply speech settings
  speechRateSelect.value = settings.speechRate.toString();
  
  // Apply backend URL
  backendUrlInput.value = settings.backendUrl;
}

// Set up event listeners
function setupEventListeners() {
  // Activate reader mode button
  activateReaderModeButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'activateReaderMode' });
      window.close();
    });
  });
  
  // Read page button
  readPageButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'readAloudPage' });
      window.close();
    });
  });
  
  // Font family select
  fontFamilySelect.addEventListener('change', saveSettings);
  
  // Font size input
  fontSizeInput.addEventListener('input', () => {
    fontSizeValue.textContent = `${fontSizeInput.value}px`;
    saveSettings();
  });
  
  // Speech rate select
  speechRateSelect.addEventListener('change', saveSettings);
  
  // Backend URL input
  backendUrlInput.addEventListener('change', saveSettings);
  
  // Theme toggle button
  themeToggleButton.addEventListener('click', () => {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    document.body.className = isDarkTheme ? 'light-theme' : 'dark-theme';
    themeToggleButton.textContent = isDarkTheme ? '🌙' : '☀️';
    saveSettings();
  });
}

// Save settings
function saveSettings() {
  // Get current settings
  const settings = {
    theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light',
    fontSize: parseInt(fontSizeInput.value),
    fontFamily: fontFamilySelect.value,
    lineHeight: 1.5,
    speechRate: parseFloat(speechRateSelect.value),
    speechPitch: 1.0,
    voiceURI: '',
    backendUrl: backendUrlInput.value.trim() || DEFAULT_SETTINGS.backendUrl
  };
  
  // Save settings
  chrome.runtime.sendMessage({ 
    action: 'saveSettings', 
    settings: settings 
  });
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePopup);
