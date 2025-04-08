/**
 * Reader Mode Browser Extension
 * config.js - Configuration settings for the extension
 */

const CONFIG = {
  // Backend API URL - Change this to your deployed backend URL in production
  GEMINI_API_URL: 'http://localhost:3000/api/extract',
  
  // Feature flags
  USE_GEMINI: true,  // Set to false to disable Gemini and use only Readability
  
  // Fallback settings
  FALLBACK_TO_READABILITY: true,  // Whether to fall back to Readability if Gemini fails
  
  // Debug settings
  DEBUG: false  // Set to true to enable debug logging
};

// Export the configuration
if (typeof module !== 'undefined') {
  module.exports = CONFIG;
}
