/**
 * Reader Mode Browser Extension
 * extension.js - Helper functions for the extension
 */

// This file provides helper functions for the extension
// It's used by popup.js to simulate clicking the extension icon

// Function to toggle reader mode
function toggleReaderMode() {
    // Get the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs && tabs.length > 0) {
            const currentTab = tabs[0];

            // Don't run on chrome:// pages, new tab page, etc.
            if (!currentTab.url.startsWith("http")) {
                return;
            }

            // Check if we're already in reader mode
            const data = await chrome.storage.session.get([
                "readerModeActive_" + currentTab.id,
            ]);
            const isReaderMode = data["readerModeActive_" + currentTab.id];

            if (isReaderMode) {
                // If already in reader mode, go back to original page
                const contentData = await chrome.storage.session.get([
                    "extractedContent_" + currentTab.id,
                ]);
                const content =
                    contentData["extractedContent_" + currentTab.id];
                if (content && content.url) {
                    chrome.tabs.update(currentTab.id, { url: content.url });
                }
                chrome.storage.session.remove(
                    "readerModeActive_" + currentTab.id
                );
            } else {
                try {
                    // Send a message to the content script to extract content
                    chrome.tabs.sendMessage(
                        currentTab.id,
                        { action: "extractContent" },
                        async (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(
                                    "Error sending message:",
                                    chrome.runtime.lastError
                                );
                                // If there's an error, try using the background script's extraction method
                                extractWithBackgroundScript(currentTab);
                                return;
                            }

                            if (response && response.success) {
                                // Store the extracted content
                                await chrome.storage.session.set({
                                    ["extractedContent_" + currentTab.id]:
                                        response.article,
                                    ["readerModeActive_" + currentTab.id]: true,
                                });

                                // Open reader page
                                chrome.tabs.update(currentTab.id, {
                                    url: chrome.runtime.getURL(
                                        "reader/reader.html"
                                    ),
                                });
                            } else {
                                console.error(
                                    "Error extracting content:",
                                    response ? response.error : "Unknown error"
                                );
                                // If there's an error, try using the background script's extraction method
                                extractWithBackgroundScript(currentTab);
                            }
                        }
                    );
                } catch (error) {
                    console.error(
                        "Error in content script communication:",
                        error
                    );
                    // If there's an error, try using the background script's extraction method
                    extractWithBackgroundScript(currentTab);
                }
            }
        }
    });
}

// Fallback function to extract content using the background script's method
function extractWithBackgroundScript(tab) {
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: function () {
                // This function will be injected into the page
                try {
                    // Use Readability.js to extract content if available
                    if (typeof Readability === "undefined") {
                        // If Readability is not available, use a simple extraction method
                        const title = document.title || "";

                        // Check if this is The Guardian website
                        const isGuardian =
                            window.location.hostname.includes(
                                "theguardian.com"
                            );

                        let content;
                        let byline =
                            document.querySelector('meta[name="author"]')
                                ?.content || "";

                        if (isGuardian) {
                            // Guardian-specific extraction
                            const mainContent =
                                document.getElementById("maincontent");
                            const contentBlocks = document.querySelectorAll(
                                'div[data-component="text-block"]'
                            );

                            if (contentBlocks && contentBlocks.length > 0) {
                                // Create a container for the content
                                const container = document.createElement("div");

                                // Add the main image if available
                                const mainImage =
                                    document.querySelector("figure img");
                                if (mainImage) {
                                    const figure =
                                        document.createElement("figure");
                                    figure.appendChild(
                                        mainImage.cloneNode(true)
                                    );

                                    const figCaption =
                                        document.querySelector("figcaption");
                                    if (figCaption) {
                                        figure.appendChild(
                                            figCaption.cloneNode(true)
                                        );
                                    }

                                    container.appendChild(figure);
                                }

                                // Add all content blocks
                                contentBlocks.forEach((block) => {
                                    container.appendChild(
                                        block.cloneNode(true)
                                    );
                                });

                                content = container;
                                byline =
                                    document.querySelector('a[rel="author"]')
                                        ?.textContent || byline;
                            } else {
                                content =
                                    mainContent ||
                                    document.querySelector("article");
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
                            classesToPreserve: [
                                "page",
                                "article",
                                "content",
                                "main",
                            ],
                            keepClasses: true, // Keep important classes for styling
                        });

                        return reader.parse();
                    }
                } catch (error) {
                    console.error("Error extracting content:", error);
                    return {
                        title: document.title,
                        content:
                            "<p>Error extracting content. Please try again.</p>",
                        url: window.location.href,
                    };
                }
            },
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

            // Open reader page in the same tab
            chrome.tabs.update(tab.id, {
                url: chrome.runtime.getURL("reader/reader.html"),
            });
        }
    );
}
