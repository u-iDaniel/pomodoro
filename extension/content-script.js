/**
 * Listens for messages from the pomoAI website and updates chrome storage accordingly.
 * @param {MessageEvent} event - The message event from the window.
 */
// Obtain messages from the pomoAI website
window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || !event.data.type) {
        return;
    }

    if (event.data.type === "TIMER") {
        chrome.storage.local.set({ 
            currentTimer: event.data.timeLeft,
            currentMode: event.data.mode,
            isActive: event.data.isActive,
        });
    }

    if (event.data.type === "BLOCKED_SITES_UPDATE") {
        chrome.storage.local.set({ 
            blockedSites: event.data.blockedSites,
        });
    }
});

/**
 * Observes the DOM for changes and checks for the presence of the pomoAI timer button.
 * Updates chrome storage with the presence status.
 */
// Check if the pomoAI timer button is present
const observer = new MutationObserver(() => {
    const timerButton = document.getElementById("pomoai-timer-button");
    chrome.storage.local.set({ isTimerPresent: !!timerButton });
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

/**
 * Listens for messages from other parts of the extension (e.g., popup) to toggle the timer.
 * @param {object} req - The request object from the sender.
 * @param {chrome.runtime.MessageSender} sender - The sender of the message.
 * @param {function} sendResponse - Function to send a response.
 * @returns {boolean} - Returns true to indicate that the response will be sent asynchronously.
 */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "TOGGLE_TIMER") {
        const timerButton = document.getElementById("pomoai-timer-button");
        timerButton.click();
    }
    return true;
});
