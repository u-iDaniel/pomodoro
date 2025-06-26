let port = chrome.runtime.connect({ name: "POMO_AI_CONTENT_SCRIPT" });
let reconnectTimeout;

/**
 *  Connects to the background script and sets up message listeners.
 *  This function is called when the content script is loaded and whenever the port disconnects.
 *  @returns {void}
 *  @description
 *  This function establishes a connection to the background script, listens for messages,
 *   and handles reconnections if the port is disconnected. It also requests the current timer state
 *   when the content script is connected.
 */
function connectToBackground() {
    if (port) {
        try {
            port.disconnect();
        } catch (error) {
            console.error("Error disconnecting previous port:", error);
        }
    }
    port = chrome.runtime.connect({ name: "POMO_AI_CONTENT_SCRIPT" });
    port.onMessage.addListener((msg) => {
        if (msg.type === "REQUEST_TIMER_STATE") {
            console.log("Content Script: Requesting current timer state");
            port.postMessage(getCurrentTimerState());
        }
    });
    port.onDisconnect.addListener(() => {
        console.log("Content Script: Port disconnected, reconnecting...");
        port = null;

        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }

        reconnectTimeout = setTimeout(() => {
            if (chrome.runtime && chrome.runtime.id) {
                console.log("Content Script: Reconnecting to background script...");
                connectToBackground();
                console.log("Content Script: Should be reconnected now.");
            }
        }, 200);

    });
}

function getCurrentTimerState() {
    return {
        type: "TIMER",
        action: "UPDATE",
        mode: "pomodoro",
        timeLeft: document.getElementById("page-timer")?.textContent || "0:00",
    };
}

function sendMessageToBackground(msg) {
    if (port) {
        try {
            port.postMessage(msg);
            return;
        } catch (error) {
            console.error( error);
            console.warn("Content Script: Attempting to reconnect...");
            connectToBackground();
            setTimeout(() => {
                sendMessageToBackground(msg);
            }, 100);
        }
    } else {
        console.warn("Content Script: Port is not connected, attempting to reconnect...");
        connectToBackground();
        setTimeout(() => {
            sendMessageToBackground(msg);
        }, 100);
    }
}


// Obtain messages from the pomoAI website
window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || !event.data.type) {
        return;
    }

    if (event.data.type === "TIMER") {
        console.log(`Content Script: Received timer update: ${event.data.timeLeft}`);
        chrome.storage.sync.set({ currentTimer: event.data.timeLeft });
        sendMessageToBackground(event.data);
    }
});

window.addEventListener("beforeunload", () => {
    port.disconnect();
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
});