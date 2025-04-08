/**
 * Reader Mode Browser Extension
 * reader.js - Injects extracted content, handles UI toggles, and text-to-speech
 */

// Global variables for TTS functionality
let speechSynthesis = window.speechSynthesis;
let speechUtterance = null;
let voices = [];
let currentParagraphIndex = 0;
let paragraphs = [];
let isPlaying = false;
let highlightedElement = null;

document.addEventListener("DOMContentLoaded", async () => {
    // Get current tab ID
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0].id;

    // Load user preferences
    loadUserPreferences();

    // Get extracted content from storage
    const data = await chrome.storage.session.get([
        "extractedContent_" + tabId,
    ]);
    const extractedContent = data["extractedContent_" + tabId];

    if (extractedContent) {
        displayContent(extractedContent);
    } else {
        displayError("No content available. Please try again.");
    }

    // Set up event listeners for UI controls
    setupEventListeners(tabId);

    // Initialize TTS functionality
    initTTS();

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        if (request.action === "readSelection" && request.text) {
            // Show the TTS controls
            document.getElementById("tts-controls").classList.remove("hidden");

            // Create a temporary utterance for the selected text
            const tempUtterance = new SpeechSynthesisUtterance(request.text);

            // Set voice
            const voiceSelect = document.getElementById("tts-voice");
            if (voiceSelect.value && voices.length > 0) {
                tempUtterance.voice = voices[parseInt(voiceSelect.value)];
            }

            // Set rate
            const rateSelect = document.getElementById("tts-rate");
            tempUtterance.rate = parseFloat(rateSelect.value);

            // Set pitch
            const pitchInput = document.getElementById("tts-pitch");
            tempUtterance.pitch = parseFloat(pitchInput.value);

            // Stop any current speech
            stopReading();

            // Start speaking the selection
            speechSynthesis.speak(tempUtterance);

            // Update UI
            isPlaying = true;
            document.getElementById("tts-play-icon").classList.add("hidden");
            document
                .getElementById("tts-pause-icon")
                .classList.remove("hidden");

            // Send response
            sendResponse({ success: true });
        }
        return true; // Required for async response
    });
});

/**
 * Display the extracted content in the reader view
 * @param {Object} content - The extracted content object
 */
function displayContent(content) {
    // Set the page title
    document.title = content.title || "Reader Mode";

    // Set the article title
    const titleElement = document.getElementById("article-title");
    titleElement.textContent = content.title || "Untitled Article";

    // Set the byline if available
    const bylineElement = document.getElementById("article-byline");
    if (content.byline) {
        bylineElement.textContent = content.byline;
        bylineElement.classList.remove("hidden");
    } else {
        bylineElement.classList.add("hidden");
    }

    // Set the article content
    const contentElement = document.getElementById("article-content");
    contentElement.innerHTML =
        content.content || "<p>No content available.</p>";

    // Set the original URL link
    const urlElement = document.getElementById("original-url");
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
    const elementsToRemove = contentElement.querySelectorAll(
        "script, iframe, object, embed, form"
    );
    elementsToRemove.forEach((element) => element.remove());

    // Make all links open in a new tab
    const links = contentElement.querySelectorAll("a");
    links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });

    // Ensure all images have alt text
    const images = contentElement.querySelectorAll("img");
    images.forEach((img) => {
        if (!img.hasAttribute("alt")) {
            img.setAttribute("alt", "Image");
        }
    });
}

/**
 * Display an error message
 * @param {string} message - The error message to display
 */
function displayError(message) {
    document.getElementById("article-title").textContent = "Error";
    document.getElementById("article-byline").classList.add("hidden");
    document.getElementById("article-content").innerHTML = `<p>${message}</p>`;
}

/**
 * Set up event listeners for UI controls
 * @param {number} tabId - The ID of the current tab
 */
function setupEventListeners(tabId) {
    // Back button
    document
        .getElementById("back-button")
        .addEventListener("click", async () => {
            const data = await chrome.storage.session.get([
                "extractedContent_" + tabId,
            ]);
            const content = data["extractedContent_" + tabId];

            if (content && content.url) {
                chrome.tabs.update({ url: content.url });
            } else {
                // If we don't have the original URL, just go back in history
                window.history.back();
            }
        });

    // Theme toggle
    document.getElementById("theme-toggle").addEventListener("click", () => {
        const body = document.body;
        const lightIcon = document.getElementById("light-icon");
        const darkIcon = document.getElementById("dark-icon");

        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
            lightIcon.classList.add("hidden");
            darkIcon.classList.remove("hidden");
            saveUserPreference("theme", "dark");
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            darkIcon.classList.add("hidden");
            lightIcon.classList.remove("hidden");
            saveUserPreference("theme", "light");
        }
    });

    // Font family selector
    document.getElementById("font-family").addEventListener("change", (e) => {
        document.body.style.fontFamily = e.target.value;
        saveUserPreference("fontFamily", e.target.value);
    });

    // Font size controls
    const contentElement = document.getElementById("article-content");
    let currentFontSize = 3; // Default (18px)

    document
        .getElementById("font-size-decrease")
        .addEventListener("click", () => {
            if (currentFontSize > 1) {
                currentFontSize--;
                updateFontSize();
            }
        });

    document
        .getElementById("font-size-increase")
        .addEventListener("click", () => {
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
        saveUserPreference("fontSize", currentFontSize);
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
    const preferences = await chrome.storage.sync.get([
        "theme",
        "fontFamily",
        "fontSize",
    ]);

    // Apply theme preference
    if (preferences.theme === "dark") {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.getElementById("light-icon").classList.add("hidden");
        document.getElementById("dark-icon").classList.remove("hidden");
    }

    // Apply font family preference
    if (preferences.fontFamily) {
        document.body.style.fontFamily = preferences.fontFamily;
        document.getElementById("font-family").value = preferences.fontFamily;
    }

    // Apply font size preference
    if (preferences.fontSize) {
        const contentElement = document.getElementById("article-content");

        // Remove all font size classes
        for (let i = 1; i <= 7; i++) {
            contentElement.classList.remove(`font-size-${i}`);
        }

        // Add the saved font size class
        contentElement.classList.add(`font-size-${preferences.fontSize}`);
    }
}

/**
 * Initialize Text-to-Speech functionality
 */
function initTTS() {
    // Get available voices
    speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        populateVoiceList();
    };

    // Initial voice population (for browsers that load voices immediately)
    voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        populateVoiceList();
    }

    // Set up TTS event listeners
    setupTTSEventListeners();

    // Parse paragraphs from the article content
    parseParagraphs();
}

/**
 * Populate the voice selection dropdown
 */
function populateVoiceList() {
    const voiceSelect = document.getElementById("tts-voice");

    // Clear existing options
    voiceSelect.innerHTML = "";

    // Add available voices
    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;

        // Set default voice (prefer English voices)
        if (voice.default || voice.lang.includes("en-")) {
            option.selected = true;
        }

        voiceSelect.appendChild(option);
    });
}

/**
 * Set up event listeners for TTS controls
 */
function setupTTSEventListeners() {
    // Main TTS toggle button
    document.getElementById("tts-toggle").addEventListener("click", () => {
        const ttsControls = document.getElementById("tts-controls");
        ttsControls.classList.toggle("hidden");

        if (!ttsControls.classList.contains("hidden") && !isPlaying) {
            // Start reading from the beginning when controls are shown
            startReading();
        }
    });

    // Play/Pause button
    document.getElementById("tts-play-pause").addEventListener("click", () => {
        if (isPlaying) {
            pauseReading();
        } else {
            startReading();
        }
    });

    // Stop button
    document.getElementById("tts-stop").addEventListener("click", stopReading);

    // Rate change
    document.getElementById("tts-rate").addEventListener("change", (e) => {
        if (speechUtterance) {
            speechUtterance.rate = parseFloat(e.target.value);

            if (isPlaying) {
                // Restart with new rate
                const currentIndex = currentParagraphIndex;
                stopReading();
                currentParagraphIndex = currentIndex;
                startReading();
            }
        }
    });

    // Voice change
    document.getElementById("tts-voice").addEventListener("change", (e) => {
        if (speechUtterance) {
            const voiceIndex = parseInt(e.target.value);
            speechUtterance.voice = voices[voiceIndex];

            if (isPlaying) {
                // Restart with new voice
                const currentIndex = currentParagraphIndex;
                stopReading();
                currentParagraphIndex = currentIndex;
                startReading();
            }
        }
    });

    // Pitch change
    document.getElementById("tts-pitch").addEventListener("input", (e) => {
        if (speechUtterance) {
            speechUtterance.pitch = parseFloat(e.target.value);

            if (isPlaying) {
                // Restart with new pitch
                const currentIndex = currentParagraphIndex;
                stopReading();
                currentParagraphIndex = currentIndex;
                startReading();
            }
        }
    });

    // Add context menu for selected text
    document
        .getElementById("article-content")
        .addEventListener("mouseup", () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                // Could implement a custom context menu here
                // For now, we'll just use the floating controls
            }
        });
}

/**
 * Parse paragraphs from the article content
 */
function parseParagraphs() {
    const contentElement = document.getElementById("article-content");

    // Get all text nodes and paragraph elements
    paragraphs = [];

    // Add title as first paragraph
    const titleElement = document.getElementById("article-title");
    paragraphs.push({
        element: titleElement,
        text: titleElement.textContent,
    });

    // Add all paragraphs from content
    const pElements = contentElement.querySelectorAll("p");
    pElements.forEach((p) => {
        if (p.textContent.trim().length > 0) {
            paragraphs.push({
                element: p,
                text: p.textContent,
            });
        }
    });

    // Add all headings from content
    const headings = contentElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => {
        if (heading.textContent.trim().length > 0) {
            paragraphs.push({
                element: heading,
                text: heading.textContent,
            });
        }
    });

    // Sort paragraphs by their position in the document
    paragraphs.sort((a, b) => {
        const posA = a.element.getBoundingClientRect().top;
        const posB = b.element.getBoundingClientRect().top;
        return posA - posB;
    });
}

/**
 * Start reading the content aloud
 */
function startReading() {
    if (paragraphs.length === 0) {
        parseParagraphs();
    }

    if (paragraphs.length === 0) return;

    // Update UI
    isPlaying = true;
    document.getElementById("tts-play-icon").classList.add("hidden");
    document.getElementById("tts-pause-icon").classList.remove("hidden");

    // Create a new utterance if needed
    if (!speechUtterance) {
        speechUtterance = new SpeechSynthesisUtterance();

        // Set voice
        const voiceSelect = document.getElementById("tts-voice");
        if (voiceSelect.value && voices.length > 0) {
            speechUtterance.voice = voices[parseInt(voiceSelect.value)];
        }

        // Set rate
        const rateSelect = document.getElementById("tts-rate");
        speechUtterance.rate = parseFloat(rateSelect.value);

        // Set pitch
        const pitchInput = document.getElementById("tts-pitch");
        speechUtterance.pitch = parseFloat(pitchInput.value);

        // Set up events
        speechUtterance.onend = () => {
            // Move to next paragraph
            currentParagraphIndex++;

            // Remove highlight from current paragraph
            if (highlightedElement) {
                highlightedElement.classList.remove("tts-highlight");
                highlightedElement = null;
            }

            // If there are more paragraphs, continue reading
            if (currentParagraphIndex < paragraphs.length) {
                startReading();
            } else {
                // Reset to beginning
                currentParagraphIndex = 0;
                isPlaying = false;
                document
                    .getElementById("tts-play-icon")
                    .classList.remove("hidden");
                document
                    .getElementById("tts-pause-icon")
                    .classList.add("hidden");
            }
        };

        speechUtterance.onboundary = () => {
            // Word boundary event for highlighting words
            // This is a more advanced feature that requires additional work
            // to implement properly with word-level highlighting
            // Uncomment to implement word-level highlighting:
            // if (event.name === 'word') {
            //     const wordIndex = event.charIndex;
            //     const wordLength = event.charLength || 1;
            //     // Implement word highlighting logic here
            // }
        };
    }

    // Set the text to read
    speechUtterance.text = paragraphs[currentParagraphIndex].text;

    // Highlight the current paragraph
    if (highlightedElement) {
        highlightedElement.classList.remove("tts-highlight");
    }
    highlightedElement = paragraphs[currentParagraphIndex].element;
    highlightedElement.classList.add("tts-highlight");

    // Scroll to the current paragraph if needed
    highlightedElement.scrollIntoView({ behavior: "smooth", block: "center" });

    // Start speaking
    speechSynthesis.speak(speechUtterance);
}

/**
 * Pause the reading
 */
function pauseReading() {
    if (isPlaying) {
        speechSynthesis.pause();
        isPlaying = false;
        document.getElementById("tts-play-icon").classList.remove("hidden");
        document.getElementById("tts-pause-icon").classList.add("hidden");
    }
}

/**
 * Resume the reading
 */
function resumeReading() {
    if (!isPlaying && speechUtterance) {
        speechSynthesis.resume();
        isPlaying = true;
        document.getElementById("tts-play-icon").classList.add("hidden");
        document.getElementById("tts-pause-icon").classList.remove("hidden");
    }
}

/**
 * Stop the reading
 */
function stopReading() {
    speechSynthesis.cancel();
    isPlaying = false;
    currentParagraphIndex = 0;

    // Update UI
    document.getElementById("tts-play-icon").classList.remove("hidden");
    document.getElementById("tts-pause-icon").classList.add("hidden");

    // Remove highlight
    if (highlightedElement) {
        highlightedElement.classList.remove("tts-highlight");
        highlightedElement = null;
    }
}
