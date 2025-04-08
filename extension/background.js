/**
 * Reader Mode Browser Extension
 * background.js - Manages toggle state, context menu, and tabs
 */

// Store the original tab URL to allow returning to it
let originalTabInfo = {};

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
    // Add context menu for reading selected text
    chrome.contextMenus.create({
        id: "read-selection",
        title: "Read selection aloud",
        contexts: ["selection"],
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "read-selection" && info.selectionText) {
        // Check if we're in reader mode
        chrome.storage.session.get(["readerModeActive_" + tab.id], (data) => {
            const isReaderMode = data["readerModeActive_" + tab.id];

            if (isReaderMode) {
                // If in reader mode, send message to read the selection
                chrome.tabs.sendMessage(tab.id, {
                    action: "readSelection",
                    text: info.selectionText,
                });
            } else {
                // If not in reader mode, first enable reader mode, then read the selection
                // Store the selection to read after reader mode is enabled
                chrome.storage.session.set({
                    ["pendingReadSelection_" + tab.id]: info.selectionText,
                });

                // Enable reader mode
                toggleReaderMode(tab);
            }
        });
    }
});

// Function to toggle reader mode
function toggleReaderMode(tab) {
    // Don't run on chrome:// pages, new tab page, etc.
    if (!tab.url.startsWith("http")) {
        return;
    }

    // Check if we're already in reader mode for this tab
    chrome.storage.session.get(["readerModeActive_" + tab.id], async (data) => {
        const isReaderMode = data["readerModeActive_" + tab.id];

        if (isReaderMode) {
            // If already in reader mode, go back to original page
            if (originalTabInfo[tab.id]) {
                chrome.tabs.update(tab.id, {
                    url: originalTabInfo[tab.id].url,
                });
                delete originalTabInfo[tab.id];
                await chrome.storage.session.remove(
                    "readerModeActive_" + tab.id
                );
            }
        } else {
            // Store original tab info
            originalTabInfo[tab.id] = { url: tab.url, title: tab.title };

            // Execute content script to extract content
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    function: extractPageContent,
                },
                async (results) => {
                    if (chrome.runtime.lastError || !results || !results[0]) {
                        console.error(
                            "Error executing script:",
                            chrome.runtime.lastError
                        );
                        return;
                    }

                    const extractedContent = results[0].result;

                    // Store the extracted content in session storage
                    await chrome.storage.session.set({
                        ["extractedContent_" + tab.id]: extractedContent,
                        ["readerModeActive_" + tab.id]: true,
                    });

                    // Check if there's a pending selection to read
                    const pendingData = await chrome.storage.session.get([
                        "pendingReadSelection_" + tab.id,
                    ]);
                    const pendingSelection =
                        pendingData["pendingReadSelection_" + tab.id];

                    // Open reader page in the same tab
                    chrome.tabs.update(
                        tab.id,
                        {
                            url: chrome.runtime.getURL("reader/reader.html"),
                        },
                        () => {
                            // If there's a pending selection to read, send it to the reader page
                            if (pendingSelection) {
                                // Wait for the reader page to load
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(tab.id, {
                                        action: "readSelection",
                                        text: pendingSelection,
                                    });
                                    // Clear the pending selection
                                    chrome.storage.session.remove(
                                        "pendingReadSelection_" + tab.id
                                    );
                                }, 1000); // Wait 1 second for the page to load
                            }
                        }
                    );
                }
            );
        }
    });
}

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
    toggleReaderMode(tab);
});

// Function to extract content from the page
function extractPageContent() {
    // This function will be injected into the page
    try {
        // Check if this is The Guardian website
        const isGuardian = window.location.hostname.includes("theguardian.com");

        // Use Readability.js to extract content if available
        if (typeof Readability === "undefined") {
            // If Readability is not available, use a simple extraction method
            const title = document.title || "";
            let content;
            let byline =
                document.querySelector('meta[name="author"]')?.content || "";

            if (isGuardian) {
                // Guardian-specific extraction
                const mainContent = document.getElementById("maincontent");
                const contentBlocks = document.querySelectorAll(
                    'div[data-component="text-block"]'
                );

                if (contentBlocks && contentBlocks.length > 0) {
                    // Create a container for the content
                    const container = document.createElement("div");

                    // Add the main image if available
                    const mainImage = document.querySelector("figure img");
                    if (mainImage) {
                        const figure = document.createElement("figure");
                        figure.appendChild(mainImage.cloneNode(true));

                        const figCaption = document.querySelector("figcaption");
                        if (figCaption) {
                            figure.appendChild(figCaption.cloneNode(true));
                        }

                        container.appendChild(figure);
                    }

                    // Add all content blocks
                    contentBlocks.forEach((block) => {
                        container.appendChild(block.cloneNode(true));
                    });

                    content = container;
                    byline =
                        document.querySelector('a[rel="author"]')
                            ?.textContent || byline;
                } else {
                    content = mainContent || document.querySelector("article");
                }
            } else {
                // Generic extraction for other sites
                content =
                    document.querySelector("article") ||
                    document.querySelector("main") ||
                    document.querySelector(".article") ||
                    document.querySelector(".content") ||
                    document.body;
            }

            return {
                title: title,
                content: content
                    ? content instanceof Element
                        ? content.innerHTML
                        : content
                    : document.body.innerHTML,
                url: window.location.href,
                byline: byline,
            };
        } else {
            // Use Readability if available
            const documentClone = document.cloneNode(true);

            // Configure Readability with better options
            const reader = new Readability(documentClone, {
                charThreshold: 400, // Lower threshold to capture more content
                classesToPreserve: ["page", "article", "content", "main"],
                keepClasses: true, // Keep important classes for styling
            });

            return reader.parse();
        }
    } catch (error) {
        console.error("Error extracting content:", error);
        return {
            title: document.title,
            content: "<p>Error extracting content. Please try again.</p>",
            url: window.location.href,
        };
    }
}

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (originalTabInfo[tabId]) {
        delete originalTabInfo[tabId];
    }
    chrome.storage.session.remove([
        "extractedContent_" + tabId,
        "readerModeActive_" + tabId,
    ]);
});
