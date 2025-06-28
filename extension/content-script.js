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

// Check if the pomoAI timer button is present
const observer = new MutationObserver(() => {
    const timerButton = document.getElementById("pomoai-timer-button");
    chrome.storage.local.set({ isTimerPresent: !!timerButton });
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "TOGGLE_TIMER") {
        const timerButton = document.getElementById("pomoai-timer-button");
        timerButton.click();
    }
    return true;
});
