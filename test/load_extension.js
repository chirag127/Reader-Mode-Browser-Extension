/**
 * Reader Mode Browser Extension
 * load_extension.js - Helper script for loading the extension in different browsers
 */

// This script provides browser-specific instructions for loading the extension
// It's meant to be run in the browser console

(function() {
  // Detect browser
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  
  // Get extension path
  const path = window.location.href.replace('test/test.html', '').replace('file:///', '');
  
  console.log('Reader Mode Extension Loading Instructions');
  console.log('----------------------------------------');
  
  if (isChrome) {
    console.log('Detected browser: Chrome');
    console.log('To load the extension:');
    console.log('1. Open chrome://extensions/');
    console.log('2. Enable "Developer mode" in the top-right corner');
    console.log('3. Click "Load unpacked" and select this directory:');
    console.log('   ' + path);
  } else if (isEdge) {
    console.log('Detected browser: Microsoft Edge');
    console.log('To load the extension:');
    console.log('1. Open edge://extensions/');
    console.log('2. Enable "Developer mode" in the bottom-left corner');
    console.log('3. Click "Load unpacked" and select this directory:');
    console.log('   ' + path);
  } else if (isFirefox) {
    console.log('Detected browser: Firefox');
    console.log('To load the extension:');
    console.log('1. Open about:debugging#/runtime/this-firefox');
    console.log('2. Click "Load Temporary Add-on"');
    console.log('3. Navigate to and select any file in this directory:');
    console.log('   ' + path);
  } else {
    console.log('Detected browser: Unknown');
    console.log('Please follow the browser-specific instructions for loading unpacked extensions.');
  }
  
  console.log('----------------------------------------');
  console.log('After loading the extension, refresh this page and click the Reader Mode icon in the toolbar.');
})();
