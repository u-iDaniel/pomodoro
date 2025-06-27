// Obtain messages from the pomoAI website
window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || !event.data.type) {
        return;
    }

    if (event.data.type === "TIMER") {
        console.log(`Content Script: Received timer update, isActive: ${event.data.isActive}`);
        chrome.storage.local.set({ 
            currentTimer: event.data.timeLeft,
            currentMode: event.data.mode,
            isActive: event.data.isActive,
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

window.addEventListener("beforeunload", () => {
    port.disconnect();
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
});