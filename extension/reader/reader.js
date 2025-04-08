/**
 * Read Aloud: Intelligent Reader Mode
 * reader.js - Script for the reader mode
 */

// Global variables
let currentSettings = null;
let isSpeaking = false;
let currentUtterance = null;
let speechSynthesis = window.speechSynthesis;
let highlightedElements = [];
let articleContent = "";

// Initialize the reader
function initializeReader() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url");

    if (!url) {
        showError("No URL provided");
        return;
    }

    // Get settings from storage
    chrome.storage.local.get("settings", (data) => {
        currentSettings = data.settings || {
            theme: "light",
            fontSize: 18,
            fontFamily: "Georgia, serif",
            lineHeight: 1.5,
            speechRate: 1.0,
            speechPitch: 1.0,
            voiceURI: "",
            backendUrl: "https://reader-mode-browser-extension.onrender.com",
        };

        // Apply settings
        applySettings();

        // Extract content
        extractContent(url);
    });

    // Set up event listeners
    setupEventListeners();

    // Populate voice selection
    populateVoiceList();

    // If speechSynthesis.onvoiceschanged is supported
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // Make TTS controls draggable
    makeDraggable(
        document.getElementById("tts-controls"),
        document.getElementById("tts-drag-handle")
    );
}

// Apply settings to the reader
function applySettings() {
    // Apply theme
    document.body.className =
        currentSettings.theme === "dark" ? "dark-theme" : "light-theme";
    document.getElementById("theme-toggle").textContent =
        currentSettings.theme === "dark" ? "☀️" : "🌙";

    // Apply font settings
    document.getElementById("article-content").style.fontFamily =
        currentSettings.fontFamily;
    document.getElementById(
        "article-content"
    ).style.fontSize = `${currentSettings.fontSize}px`;

    // Apply speech settings
    document.getElementById("tts-speed").value =
        currentSettings.speechRate.toString();

    // Apply voice selection if available
    if (currentSettings.voiceURI) {
        const voiceSelect = document.getElementById("tts-voice");
        if (
            voiceSelect.querySelector(
                `option[value="${currentSettings.voiceURI}"]`
            )
        ) {
            voiceSelect.value = currentSettings.voiceURI;
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    document
        .getElementById("theme-toggle")
        .addEventListener("click", toggleTheme);

    // Font size controls
    document
        .getElementById("decrease-font")
        .addEventListener("click", () => changeFontSize(-1));
    document
        .getElementById("increase-font")
        .addEventListener("click", () => changeFontSize(1));

    // Read aloud button
    document.getElementById("read-aloud").addEventListener("click", readAloud);

    // Close reader button
    document
        .getElementById("close-reader")
        .addEventListener("click", closeReader);

    // TTS controls
    document
        .getElementById("tts-play-pause")
        .addEventListener("click", togglePlayPause);
    document.getElementById("tts-stop").addEventListener("click", stopSpeech);
    document.getElementById("tts-speed").addEventListener("change", (e) => {
        currentSettings.speechRate = parseFloat(e.target.value);
        saveSettings();

        if (currentUtterance) {
            currentUtterance.rate = currentSettings.speechRate;
        }
    });

    document.getElementById("tts-voice").addEventListener("change", (e) => {
        currentSettings.voiceURI = e.target.value;
        saveSettings();
    });
}

// Extract content from the URL
async function extractContent(url) {
    try {
        // Show loading message
        document.getElementById("article-content").innerHTML =
            "<p>Loading content...</p>";

        // Call the background script to extract content
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                {
                    action: "extractContent",
                    url: url,
                },
                resolve
            );
        });

        if (!response.success) {
            throw new Error(response.error || "Failed to extract content");
        }

        // Set the title
        document.getElementById("article-title").textContent =
            response.content.title;
        document.title = response.content.title + " - Reader Mode";

        // Format and set the content
        articleContent = response.content.content;
        document.getElementById("article-content").innerHTML =
            formatContent(articleContent);
    } catch (error) {
        console.error("Error extracting content:", error);
        showError("Failed to extract content: " + error.message);
    }
}

// Format the content for display - using the function from markdown-utils.js
// The implementation is now in markdown-utils.js

// Toggle between light and dark themes
function toggleTheme() {
    if (document.body.classList.contains("light-theme")) {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        currentSettings.theme = "dark";
        document.getElementById("theme-toggle").textContent = "☀️";
    } else {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        currentSettings.theme = "light";
        document.getElementById("theme-toggle").textContent = "🌙";
    }

    saveSettings();
}

// Change font size
function changeFontSize(delta) {
    currentSettings.fontSize = Math.max(
        12,
        Math.min(32, currentSettings.fontSize + delta)
    );
    document.getElementById(
        "article-content"
    ).style.fontSize = `${currentSettings.fontSize}px`;
    saveSettings();
}

// Save settings
function saveSettings() {
    chrome.storage.local.set({ settings: currentSettings });
}

// Populate voice selection dropdown
function populateVoiceList() {
    const voiceSelect = document.getElementById("tts-voice");

    // Clear existing options
    voiceSelect.innerHTML = "";

    // Get available voices
    const voices = speechSynthesis.getVoices();

    // Add each voice as an option
    voices.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.voiceURI;
        option.textContent = `${voice.name} (${voice.lang})`;

        if (currentSettings && currentSettings.voiceURI === voice.voiceURI) {
            option.selected = true;
        }

        voiceSelect.appendChild(option);
    });

    // If no voice is selected, select the default
    if (currentSettings && !voiceSelect.value && voices.length > 0) {
        voiceSelect.value = voices[0].voiceURI;
        currentSettings.voiceURI = voices[0].voiceURI;
        saveSettings();
    }
}

// Read the article aloud
function readAloud() {
    // Get the article content
    const content = document.getElementById("article-content");
    if (!content) return;

    // Show TTS controls
    document.getElementById("tts-controls").style.display = "block";

    // Read the content
    startSpeech(content.textContent);
}

// Start speech
function startSpeech(text) {
    // Stop any current speech
    stopSpeech();

    // Create a new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);

    // Set utterance properties
    currentUtterance.rate = currentSettings.speechRate;
    currentUtterance.pitch = currentSettings.speechPitch;

    // Set voice if specified
    if (currentSettings.voiceURI) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(
            (voice) => voice.voiceURI === currentSettings.voiceURI
        );
        if (selectedVoice) {
            currentUtterance.voice = selectedVoice;
        }
    }

    // Update play/pause button
    document.getElementById("tts-play-pause").textContent = "⏸️";

    // Store the original text for highlighting
    const originalText = text;

    // Prepare text for better word boundary detection
    // Add spaces around punctuation to help with word boundary detection
    const preparedText = text
        .replace(/([.,!?;:])/g, " $1 ")
        .replace(/\\s+/g, " ")
        .trim();

    // Split text into words for highlighting
    const words = preparedText.split(/\\s+/);
    console.log(`Text split into ${words.length} words for highlighting`);
    let wordIndex = 0;

    // Keep track of the current position in the text
    let currentPosition = 0;

    // Create a map of word positions for faster lookup
    const wordPositions = [];
    let pos = 0;
    const textLower = originalText.toLowerCase();

    // Pre-compute word positions for more accurate highlighting
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .trim()
            .toLowerCase();
        if (word === "") continue;

        // Find the position of this word after the current position
        const wordPos = textLower.indexOf(word, pos);
        if (wordPos !== -1) {
            wordPositions.push({
                word: word,
                position: wordPos,
                length: word.length,
            });
            // Move past this word for the next search
            pos = wordPos + word.length;
        }
    }

    console.log(
        `Mapped ${wordPositions.length} word positions for highlighting`
    );

    // Handle word boundaries for highlighting
    currentUtterance.onboundary = (event) => {
        if (event.name === "word") {
            // Only process if we have a valid word index
            if (wordIndex < words.length) {
                // Clear previous highlights
                clearHighlights();

                // Get the current word
                const currentWord = words[wordIndex]
                    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                    .trim();
                console.log(
                    `Processing word boundary: "${currentWord}" (${wordIndex}/${words.length})`
                );

                // Find the position of this word in our pre-computed map
                if (wordIndex < wordPositions.length) {
                    const wordInfo = wordPositions[wordIndex];
                    // Highlight the word at the specific position
                    highlightWordAtPosition(
                        currentWord,
                        wordInfo.position,
                        wordInfo.length
                    );
                } else {
                    // Fallback to the regular highlighting if we don't have position info
                    highlightWord(currentWord, currentPosition);
                    // Update the current position to search after this word next time
                    const wordPos = textLower.indexOf(
                        currentWord.toLowerCase(),
                        currentPosition
                    );
                    if (wordPos !== -1) {
                        currentPosition = wordPos + currentWord.length;
                    }
                }

                // Increment word index
                wordIndex++;

                // Scroll to the highlighted word if needed
                scrollToHighlight();
            }
        }
    };

    // Handle speech end
    currentUtterance.onend = () => {
        isSpeaking = false;
        console.log("Speech ended");

        // Update play/pause button
        document.getElementById("tts-play-pause").textContent = "▶️";

        // Clear highlights
        clearHighlights();
    };

    // Handle speech errors
    currentUtterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        isSpeaking = false;

        // Update play/pause button
        document.getElementById("tts-play-pause").textContent = "▶️";

        // Clear highlights
        clearHighlights();
    };

    // Start speaking
    speechSynthesis.speak(currentUtterance);
    isSpeaking = true;
    console.log("Started speaking");

    // Force a highlight of the first word immediately
    if (words.length > 0) {
        setTimeout(() => {
            if (isSpeaking && wordIndex === 0) {
                clearHighlights();
                highlightWord(words[0]);
                wordIndex = 1;
                scrollToHighlight();
            }
        }, 100);
    }
}

// Toggle play/pause for speech
function togglePlayPause() {
    const playPauseButton = document.getElementById("tts-play-pause");

    if (isSpeaking) {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            playPauseButton.textContent = "⏸️";
        } else {
            speechSynthesis.pause();
            playPauseButton.textContent = "▶️";
        }
    } else {
        readAloud();
    }
}

// Stop speech
function stopSpeech() {
    speechSynthesis.cancel();
    isSpeaking = false;

    // Update play/pause button
    document.getElementById("tts-play-pause").textContent = "▶️";

    // Hide controls
    document.getElementById("tts-controls").style.display = "none";

    // Remove all highlights
    clearHighlights();
}

// Highlight a word in the reader content starting from a specific position
function highlightWord(word, startPosition = 0) {
    if (!word) return;

    // Clean the word from any punctuation for better matching
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (cleanWord.trim() === "") return;

    const content = document.getElementById("article-content");
    if (!content) return;

    // Find all text nodes in the content
    const textNodes = [];
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }

    // Keep track of the character position in the overall text
    let charPosition = 0;
    let foundNode = null;
    let foundIndex = -1;

    // First, find the node and position that contains the character at startPosition
    for (const node of textNodes) {
        const nodeLength = node.nodeValue.length;

        // If this node contains the target position
        if (
            charPosition <= startPosition &&
            startPosition < charPosition + nodeLength
        ) {
            foundNode = node;
            foundIndex = startPosition - charPosition;
            break;
        }

        charPosition += nodeLength;
    }

    // If we found the node containing the start position, start searching from there
    if (foundNode) {
        // Start from the found node
        let nodeIndex = textNodes.indexOf(foundNode);
        let searchStartIndex = foundIndex;

        for (let i = nodeIndex; i < textNodes.length; i++) {
            const node = textNodes[i];
            const text = node.nodeValue;

            // For the first node, start from the found index
            const startIdx = i === nodeIndex ? searchStartIndex : 0;

            // Try exact match first
            let wordRegex = new RegExp(`\\b${cleanWord}\\b`, "i");
            let match = null;

            // Use exec with lastIndex to start from the correct position
            wordRegex.lastIndex = startIdx;
            match = wordRegex.exec(text.slice(startIdx));

            // Adjust match index if found
            if (match) {
                match.index += startIdx;
            }

            // If no exact match, try a more flexible match
            if (!match) {
                wordRegex = new RegExp(`${cleanWord}`, "i");
                wordRegex.lastIndex = startIdx;
                match = wordRegex.exec(text.slice(startIdx));

                // Adjust match index if found
                if (match) {
                    match.index += startIdx;
                }
            }

            if (match) {
                try {
                    // Create a range for the matched word
                    const range = document.createRange();
                    range.setStart(node, match.index);
                    range.setEnd(node, match.index + match[0].length);

                    // Create a highlight span
                    const highlight = document.createElement("span");
                    highlight.className = "tts-highlight";

                    // Wrap the range with the highlight span
                    range.surroundContents(highlight);

                    // Store the highlighted element
                    highlightedElements.push(highlight);

                    // Log successful highlighting
                    console.log(
                        `Highlighted word: "${match[0]}" at position ${
                            charPosition + match.index
                        }`
                    );

                    // Only highlight the first occurrence after the start position
                    return;
                } catch (error) {
                    console.error("Error highlighting word:", error);
                    // Continue to the next node if there's an error
                    continue;
                }
            }

            // Update character position for the next node
            charPosition += text.length;
        }
    }

    // Fallback to the old method if we couldn't find the word at the specified position
    console.log(`Falling back to basic highlighting for word: "${cleanWord}"`);

    // Search for the word in each text node (original implementation)
    for (const node of textNodes) {
        const text = node.nodeValue;

        // Try exact match first
        let wordRegex = new RegExp(`\\b${cleanWord}\\b`, "i");
        let match = wordRegex.exec(text);

        // If no exact match, try a more flexible match
        if (!match) {
            wordRegex = new RegExp(`${cleanWord}`, "i");
            match = wordRegex.exec(text);
        }

        if (match) {
            try {
                // Create a range for the matched word
                const range = document.createRange();
                range.setStart(node, match.index);
                range.setEnd(node, match.index + match[0].length);

                // Create a highlight span
                const highlight = document.createElement("span");
                highlight.className = "tts-highlight";

                // Wrap the range with the highlight span
                range.surroundContents(highlight);

                // Store the highlighted element
                highlightedElements.push(highlight);

                // Log successful highlighting
                console.log(
                    `Highlighted word: "${match[0]}" (fallback method)`
                );

                // Only highlight the first occurrence
                break;
            } catch (error) {
                console.error("Error highlighting word:", error);
                // Continue to the next node if there's an error
                continue;
            }
        }
    }
}

// Highlight a word at a specific position in the text
function highlightWordAtPosition(word, position, length) {
    if (!word || position < 0 || length <= 0) return;

    const content = document.getElementById("article-content");
    if (!content) return;

    // Find all text nodes in the content
    const textNodes = [];
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }

    // Keep track of the character position in the overall text
    let charPosition = 0;

    // Find the node and position that contains the character at 'position'
    for (const node of textNodes) {
        const nodeLength = node.nodeValue.length;

        // If this node contains the target position
        if (charPosition <= position && position < charPosition + nodeLength) {
            try {
                // Calculate the start and end positions within this node
                const startOffset = position - charPosition;
                let endOffset = startOffset + length;

                // Make sure endOffset doesn't exceed the node length
                endOffset = Math.min(endOffset, nodeLength);

                // Create a range for the word at the specific position
                const range = document.createRange();
                range.setStart(node, startOffset);
                range.setEnd(node, endOffset);

                // Create a highlight span
                const highlight = document.createElement("span");
                highlight.className = "tts-highlight";

                // Wrap the range with the highlight span
                range.surroundContents(highlight);

                // Store the highlighted element
                highlightedElements.push(highlight);

                console.log(
                    `Highlighted word at exact position: ${position}, length: ${length}`
                );
                return;
            } catch (error) {
                console.error("Error highlighting word at position:", error);
                // Fall back to the regular highlighting method
                highlightWord(word, position);
                return;
            }
        }

        charPosition += nodeLength;
    }

    // If we couldn't find the exact position, fall back to the regular method
    console.log(
        `Couldn't find exact position ${position}, falling back to regular highlighting`
    );
    highlightWord(word, position);
}

// Clear all word highlights
function clearHighlights() {
    highlightedElements.forEach((element) => {
        // Replace the highlight with its text content
        if (element.parentNode) {
            const textNode = document.createTextNode(element.textContent);
            element.parentNode.replaceChild(textNode, element);
        }
    });

    // Clear the array
    highlightedElements = [];
}

// Scroll to the highlighted word
function scrollToHighlight() {
    if (highlightedElements.length > 0) {
        const highlight = highlightedElements[0];

        // Get the position of the highlight
        const rect = highlight.getBoundingClientRect();

        // Calculate the target scroll position
        const scrollTarget = window.scrollY + rect.top - window.innerHeight / 2;

        // Smooth scroll to the target
        window.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
        });
    }
}

// Make an element draggable
function makeDraggable(element, handle) {
    let isDragging = false;
    let offsetX, offsetY;

    handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            element.style.left = e.clientX - offsetX + "px";
            element.style.top = e.clientY - offsetY + "px";
            e.preventDefault();
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

// Close the reader and return to the original page
function closeReader() {
    // Stop any speech
    stopSpeech();

    // Send message to close the reader
    chrome.runtime.sendMessage({ action: "closeReader" });
}

// Show error message
function showError(message) {
    document.getElementById("article-title").textContent = "Error";
    document.getElementById(
        "article-content"
    ).innerHTML = `<p class="error-message">${message}</p>`;
}

// Initialize the reader when the page loads
document.addEventListener("DOMContentLoaded", initializeReader);
