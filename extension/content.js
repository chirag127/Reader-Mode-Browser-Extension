/**
 * Read Aloud: Intelligent Reader Mode
 * content.js - Content script for the extension
 */

// Global variables
let isReaderModeActive = false;
let isSpeaking = false;
let currentUtterance = null;
let speechSynthesis = window.speechSynthesis;
let controlsContainer = null;
let highlightedElements = [];
let currentSettings = null;

// Initialize the content script
function initialize() {
    // Get settings from background script
    chrome.runtime.sendMessage({ action: "getSettings" }, (settings) => {
        currentSettings = settings;
    });

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "activateReaderMode") {
            activateReaderMode();
        } else if (message.action === "readAloudSelection") {
            readAloud(message.text);
        } else if (message.action === "readAloudPage") {
            readAloudPage();
        }
    });
}

// Activate reader mode
async function activateReaderMode() {
    if (isReaderModeActive) return;

    try {
        // Show loading indicator
        showLoadingIndicator();

        // Get the current page URL and HTML content
        const url = window.location.href;
        const html = document.documentElement.outerHTML;

        // Extract content using the backend API
        let extractedContent;
        try {
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    {
                        action: "extractContent",
                        url: url,
                        html: html,
                    },
                    resolve
                );
            });

            if (!response) {
                throw new Error("No response from background script");
            }

            if (!response.success) {
                throw new Error(response.error || "Failed to extract content");
            }

            extractedContent = response.content;
        } catch (error) {
            console.error("Error communicating with backend:", error);
            throw new Error(`Backend communication error: ${error.message}`);
        }

        // Create reader mode UI
        createReaderModeUI(extractedContent);
        isReaderModeActive = true;
    } catch (error) {
        console.error("Error activating reader mode:", error);
        hideLoadingIndicator();
        showErrorMessage("Failed to activate reader mode: " + error.message);
    }
}

// Create the reader mode UI
function createReaderModeUI(content) {
    // Create reader container
    const readerContainer = document.createElement("div");
    readerContainer.id = "reader-mode-container";
    readerContainer.className =
        currentSettings.theme === "dark" ? "dark-theme" : "light-theme";

    // Create reader content
    const readerContent = document.createElement("div");
    readerContent.id = "reader-content";
    readerContent.style.fontFamily = currentSettings.fontFamily;
    readerContent.style.fontSize = `${currentSettings.fontSize}px`;
    readerContent.style.lineHeight = currentSettings.lineHeight;

    // Create title
    const title = document.createElement("h1");
    title.id = "reader-title";
    title.textContent = content.title;

    // Create content
    const articleContent = document.createElement("div");
    articleContent.id = "reader-article";
    articleContent.innerHTML = formatContent(content.content);

    // Create toolbar
    const toolbar = createToolbar();

    // Assemble the reader UI
    readerContent.appendChild(title);
    readerContent.appendChild(articleContent);
    readerContainer.appendChild(toolbar);
    readerContainer.appendChild(readerContent);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.id = "reader-close-button";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", deactivateReaderMode);
    readerContainer.appendChild(closeButton);

    // Add to page
    document.body.appendChild(readerContainer);

    // Hide the original content
    document.body.style.overflow = "hidden";

    // Hide loading indicator
    hideLoadingIndicator();

    // Create floating controls for TTS
    createFloatingControls();
}

// Format the content for display - using the function from markdown-utils.js
// The implementation is now in markdown-utils.js

// Create the toolbar for reader mode
function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.id = "reader-toolbar";

    // Theme toggle
    const themeToggle = document.createElement("button");
    themeToggle.id = "theme-toggle";
    themeToggle.textContent = currentSettings.theme === "dark" ? "☀️" : "🌙";
    themeToggle.title =
        currentSettings.theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode";
    themeToggle.addEventListener("click", toggleTheme);

    // Font size controls
    const fontSizeControls = document.createElement("div");
    fontSizeControls.className = "font-size-controls";

    const decreaseFontButton = document.createElement("button");
    decreaseFontButton.textContent = "A-";
    decreaseFontButton.addEventListener("click", () => changeFontSize(-1));

    const increaseFontButton = document.createElement("button");
    increaseFontButton.textContent = "A+";
    increaseFontButton.addEventListener("click", () => changeFontSize(1));

    fontSizeControls.appendChild(decreaseFontButton);
    fontSizeControls.appendChild(increaseFontButton);

    // Read aloud button
    const readAloudButton = document.createElement("button");
    readAloudButton.id = "read-aloud-button";
    readAloudButton.textContent = "🔊 Read Aloud";
    readAloudButton.addEventListener("click", readAloudPage);

    // Add elements to toolbar
    toolbar.appendChild(themeToggle);
    toolbar.appendChild(fontSizeControls);
    toolbar.appendChild(readAloudButton);

    return toolbar;
}

// Create floating controls for text-to-speech
function createFloatingControls() {
    // Remove existing controls if any
    if (controlsContainer) {
        controlsContainer.remove();
    }

    // Create controls container
    controlsContainer = document.createElement("div");
    controlsContainer.id = "tts-controls-container";
    controlsContainer.className =
        currentSettings.theme === "dark" ? "dark-theme" : "light-theme";

    // Create controls
    const controls = document.createElement("div");
    controls.id = "tts-controls";

    // Play/Pause button
    const playPauseButton = document.createElement("button");
    playPauseButton.id = "tts-play-pause";
    playPauseButton.textContent = "▶️";
    playPauseButton.addEventListener("click", togglePlayPause);

    // Stop button
    const stopButton = document.createElement("button");
    stopButton.id = "tts-stop";
    stopButton.textContent = "⏹️";
    stopButton.addEventListener("click", stopSpeech);

    // Speed control
    const speedControl = document.createElement("select");
    speedControl.id = "tts-speed";

    const speeds = [
        0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 3.0, 4.0, 6.0, 8.0, 10.0, 12.0,
        16.0,
    ];
    speeds.forEach((speed) => {
        const option = document.createElement("option");
        option.value = speed;
        option.textContent = `${speed}x`;
        if (speed === currentSettings.speechRate) {
            option.selected = true;
        }
        speedControl.appendChild(option);
    });

    speedControl.addEventListener("change", (e) => {
        currentSettings.speechRate = parseFloat(e.target.value);
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: currentSettings,
        });

        if (currentUtterance) {
            currentUtterance.rate = currentSettings.speechRate;
        }
    });

    // Voice selection
    const voiceSelect = document.createElement("select");
    voiceSelect.id = "tts-voice";

    // Populate with available voices
    populateVoiceList(voiceSelect);

    // If speechSynthesis.onvoiceschanged is supported
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => populateVoiceList(voiceSelect);
    }

    voiceSelect.addEventListener("change", (e) => {
        currentSettings.voiceURI = e.target.value;
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: currentSettings,
        });
    });

    // Assemble controls
    controls.appendChild(playPauseButton);
    controls.appendChild(stopButton);
    controls.appendChild(speedControl);
    controls.appendChild(voiceSelect);

    // Make controls draggable
    const dragHandle = document.createElement("div");
    dragHandle.id = "tts-drag-handle";
    dragHandle.textContent = "⋮⋮";

    // Add drag functionality
    let isDragging = false;
    let offsetX, offsetY;

    dragHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - controlsContainer.getBoundingClientRect().left;
        offsetY = e.clientY - controlsContainer.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            controlsContainer.style.left = e.clientX - offsetX + "px";
            controlsContainer.style.top = e.clientY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Add elements to container
    controlsContainer.appendChild(dragHandle);
    controlsContainer.appendChild(controls);

    // Add to page (initially hidden)
    controlsContainer.style.display = "none";
    document.body.appendChild(controlsContainer);
}

// Populate voice selection dropdown
function populateVoiceList(voiceSelect) {
    // Clear existing options
    voiceSelect.innerHTML = "";

    // Get available voices
    const voices = speechSynthesis.getVoices();

    // Add each voice as an option
    voices.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.voiceURI;
        option.textContent = `${voice.name} (${voice.lang})`;

        if (currentSettings.voiceURI === voice.voiceURI) {
            option.selected = true;
        }

        voiceSelect.appendChild(option);
    });

    // If no voice is selected, select the default
    if (!voiceSelect.value && voices.length > 0) {
        voiceSelect.value = voices[0].voiceURI;
        currentSettings.voiceURI = voices[0].voiceURI;
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: currentSettings,
        });
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
        readAloudPage();
    }
}

// Stop speech
function stopSpeech() {
    speechSynthesis.cancel();
    isSpeaking = false;

    // Update play/pause button
    const playPauseButton = document.getElementById("tts-play-pause");
    if (playPauseButton) {
        playPauseButton.textContent = "▶️";
    }

    // Hide controls
    if (controlsContainer) {
        controlsContainer.style.display = "none";
    }

    // Remove all highlights
    clearHighlights();
}

// Read the entire page aloud
function readAloudPage() {
    if (!isReaderModeActive) {
        // If reader mode is not active, activate it first
        activateReaderMode().then(() => {
            // Once reader mode is active, read the content
            const content = document.getElementById("reader-article");
            if (content) {
                readAloud(content.textContent);
            }
        });
    } else {
        // If reader mode is already active, read the content
        const content = document.getElementById("reader-article");
        if (content) {
            readAloud(content.textContent);
        }
    }
}

// Read text aloud with word highlighting
function readAloud(text) {
    // Stop any current speech
    stopSpeech();

    // Show controls
    if (controlsContainer) {
        controlsContainer.style.display = "block";
    }

    // Store the original text for highlighting
    const originalText = text;

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
    const playPauseButton = document.getElementById("tts-play-pause");
    if (playPauseButton) {
        playPauseButton.textContent = "⏸️";
    }

    // Prepare text for better word boundary detection
    // Add spaces around punctuation to help with word boundary detection
    const preparedText = text
        .replace(/([.,!?;:])/g, " $1 ")
        .replace(/\s+/g, " ")
        .trim();

    // Split text into words for highlighting
    const words = preparedText.split(/\s+/);
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
        if (playPauseButton) {
            playPauseButton.textContent = "▶️";
        }

        // Clear highlights
        clearHighlights();
    };

    // Handle speech errors
    currentUtterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        isSpeaking = false;

        // Update play/pause button
        if (playPauseButton) {
            playPauseButton.textContent = "▶️";
        }

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

// Highlight a word in the reader content starting from a specific position
function highlightWord(word, startPosition = 0) {
    if (!word) return;

    // Clean the word from any punctuation for better matching
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (cleanWord.trim() === "") return;

    const content = document.getElementById("reader-article");
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

    const content = document.getElementById("reader-article");
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

// Toggle between light and dark themes
function toggleTheme() {
    const container = document.getElementById("reader-mode-container");
    if (!container) return;

    // Toggle theme class
    if (container.classList.contains("light-theme")) {
        container.classList.remove("light-theme");
        container.classList.add("dark-theme");
        currentSettings.theme = "dark";
        document.getElementById("theme-toggle").textContent = "☀️";
        document.getElementById("theme-toggle").title = "Switch to light mode";
    } else {
        container.classList.remove("dark-theme");
        container.classList.add("light-theme");
        currentSettings.theme = "light";
        document.getElementById("theme-toggle").textContent = "🌙";
        document.getElementById("theme-toggle").title = "Switch to dark mode";
    }

    // Update controls theme
    if (controlsContainer) {
        controlsContainer.className =
            currentSettings.theme === "dark" ? "dark-theme" : "light-theme";
    }

    // Save settings
    chrome.runtime.sendMessage({
        action: "saveSettings",
        settings: currentSettings,
    });
}

// Change font size
function changeFontSize(delta) {
    const content = document.getElementById("reader-content");
    if (!content) return;

    // Update font size
    currentSettings.fontSize = Math.max(
        12,
        Math.min(32, currentSettings.fontSize + delta)
    );
    content.style.fontSize = `${currentSettings.fontSize}px`;

    // Save settings
    chrome.runtime.sendMessage({
        action: "saveSettings",
        settings: currentSettings,
    });
}

// Deactivate reader mode
function deactivateReaderMode() {
    // Stop any speech
    stopSpeech();

    // Remove reader mode container
    const container = document.getElementById("reader-mode-container");
    if (container) {
        container.remove();
    }

    // Remove floating controls
    if (controlsContainer) {
        controlsContainer.remove();
        controlsContainer = null;
    }

    // Restore original content
    document.body.style.overflow = "";

    isReaderModeActive = false;
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "reader-loading-indicator";
    loadingIndicator.innerHTML =
        '<div class="spinner"></div><p>Loading Reader Mode...</p>';
    document.body.appendChild(loadingIndicator);
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById(
        "reader-loading-indicator"
    );
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Show error message
function showErrorMessage(message) {
    const errorMessage = document.createElement("div");
    errorMessage.id = "reader-error-message";
    errorMessage.innerHTML = `<p>${message}</p><button id="reader-error-close">Close</button>`;

    // Add close button functionality
    errorMessage
        .querySelector("#reader-error-close")
        .addEventListener("click", () => {
            errorMessage.remove();
        });

    document.body.appendChild(errorMessage);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.remove();
        }
    }, 5000);
}

// Initialize the content script
initialize();
