const pomoAIWebsitePatterns = ["*://localhost/*", "*://pomoai.tech/*"];

function isUrlBlocked(url, blockedSites) {
  try {
    const currentHostname = new URL(url).hostname;
    return blockedSites.some(site => currentHostname.includes(site));
  } catch (e) {
    // Invalid URL (e.g., chrome://extensions), so don't block.
    return false;
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url || !changeInfo.url) {
    return;
  }

  const { isActive, currentMode, blockedSites } = await chrome.storage.local.get(['isActive', 'currentMode', 'blockedSites']);
  if (isActive && currentMode === 'pomodoro' && blockedSites && blockedSites.length > 0) {
    if (isUrlBlocked(tab.url, blockedSites)) {
      console.log(`Blocking tab ${tabId} with URL: ${tab.url}`);
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    } else {
      console.log(`Tab ${tabId} with URL: ${tab.url} is not blocked.`);
    }
  }
});

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