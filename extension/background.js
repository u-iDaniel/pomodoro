const pomoAIWebsitePattern = "*://localhost/*";
const PORTS = new Set();

chrome.runtime.onConnect.addListener((port) => {
  console.log(`Background: Port connected: ${port.name}`);
  PORTS.add(port);

  if (port.name === "POMO_AI_CONTENT_SCRIPT") {
    port.onMessage.addListener((msg) => {
      if (msg.type === "TIMER" && msg.action === "UPDATE") {
        console.log(`Background: Timer update from content script: ${msg.timeLeft}`);
        PORTS.forEach((p) => {
          if (p.name === "POMO_AI_POPUP") {
            p.postMessage(msg);
          }
        });
      }
    });
  }

  if (port.name === "POMO_AI_POPUP") {
    PORTS.forEach((p) => {
      if (p.name === "POMO_AI_CONTENT_SCRIPT") {
        console.log(`Background: Requesting timer state from content script`);
        p.postMessage({ type: "REQUEST_TIMER_STATE" });
      }
    });
  }

  port.onDisconnect.addListener(() => {
    console.log(`Background: Port disconnected: ${port.name}`);
    PORTS.delete(port);
  });
});

async function checkPomoAITab() {
  const tabs = await chrome.tabs.query({ url: pomoAIWebsitePattern });
  const isPresent = tabs.length > 0;

  await chrome.storage.sync.set({ isPomoAITabPresent: isPresent });

  if (isPresent) {
    await chrome.action.setIcon({ path: "icons/icon128.png" });
  } else {
    await chrome.action.setIcon({ path: "icons/icon128-disabled.png" });
  }
  return isPresent;
}

// Check for PomoAI tab at all times
chrome.runtime.onInstalled.addListener(() => {
  checkPomoAITab();
});

chrome.runtime.onStartup.addListener(() => {
  checkPomoAITab();
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkPomoAITab();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    checkPomoAITab();
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  checkPomoAITab();
});