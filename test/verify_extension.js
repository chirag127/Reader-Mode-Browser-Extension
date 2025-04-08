/**
 * Reader Mode Browser Extension
 * verify_extension.js - Helper script for verifying the extension functionality
 */

// This script checks if the extension is properly installed and functioning
// It's meant to be run in the browser console after loading the extension

(function() {
  console.log('Reader Mode Extension Verification');
  console.log('----------------------------------');
  
  // Check if the extension is installed
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    console.log('✅ Extension is installed with ID: ' + chrome.runtime.id);
    
    // Check if we can access the extension's API
    if (typeof chrome.action !== 'undefined') {
      console.log('✅ Extension API is accessible');
      
      // Try to get the extension's manifest
      chrome.runtime.getManifest().then(manifest => {
        console.log('✅ Extension manifest loaded successfully');
        console.log('   Name: ' + manifest.name);
        console.log('   Version: ' + manifest.version);
        console.log('   Description: ' + manifest.description);
        
        console.log('----------------------------------');
        console.log('The extension appears to be working correctly.');
        console.log('Click the Reader Mode icon in the toolbar to test the reader functionality.');
      }).catch(error => {
        console.log('❌ Failed to load extension manifest: ' + error.message);
      });
    } else {
      console.log('❌ Extension API is not accessible');
      console.log('This might be due to permission issues or the extension not being properly loaded.');
    }
  } else {
    console.log('❌ Extension is not installed or not detected');
    console.log('Please make sure you have loaded the extension correctly.');
    console.log('See the instructions in load_extension.js for details.');
  }
})();
