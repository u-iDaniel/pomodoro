const pomoAIWebsitePattern = "*://localhost/*";

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