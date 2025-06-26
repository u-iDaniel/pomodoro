let port = chrome.runtime.connect({ name: "POMO_AI_CONTENT_SCRIPT" });

// Obtain messages from the pomoAI website
window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || !event.data.type) {
        return;
    }

    if (event.data.type === "TIMER") {
        console.log(`Content Script: Received timer update: ${event.data.timeLeft}`);
        chrome.storage.sync.set({ currentTimer: event.data.timeLeft });
        chrome.storage.sync.set({ currentMode: event.data.mode });
    }
});

window.addEventListener("beforeunload", () => {
    port.disconnect();
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
});