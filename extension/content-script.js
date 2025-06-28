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

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "TOGGLE_TIMER") {
        const timerButton = document.getElementById("pomoai-timer-button");
        if (!timerButton) {
            console.log("Content Script: Timer button not found");
            return;
        }
        timerButton.click();
    }
    return true;
});
