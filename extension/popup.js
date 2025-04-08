/**
 * Reader Mode Browser Extension
 * popup.js - Handles popup UI interactions
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    // Check if we're already in reader mode
    const data = await chrome.storage.session.get([
        "readerModeActive_" + currentTab.id,
    ]);
    const isReaderMode = data["readerModeActive_" + currentTab.id];

    const enableButton = document.getElementById("enable-reader-mode");

    if (isReaderMode) {
        enableButton.textContent = "Exit Reader Mode";
        enableButton.classList.add("secondary");
    }

    // Set up click handler for the button
    enableButton.addEventListener("click", () => {
        // Use the toggleReaderMode function from extension.js
        toggleReaderMode();
        // Close the popup
        window.close();
    });
});
