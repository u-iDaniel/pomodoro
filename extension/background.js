const pomoAIWebsitePatterns = ["*://localhost/*", "*://pomoai.tech/*"];

async function checkPomoAITab() {
  const tabs = await chrome.tabs.query({ url: pomoAIWebsitePatterns });
  const isPresent = tabs.length === 1;
  const isTooManyTabs = tabs.length > 1;

  await chrome.storage.local.set({ 
    isPomoAITabPresent: isPresent,
    isTooManyPomoAITabs: isTooManyTabs,
  });

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