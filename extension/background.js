const pomoAIWebsiteChromePatterns = ["*://localhost/*", "*://pomoai.tech/*"];
const pomoAIWebsitePatterns = ["localhost", "pomoai.tech"];

function isUrlBlocked(url, blockedSites) {
  // Don't block URLs that are part of the webpage itself or the extension
  if (url.startsWith('chrome://') || pomoAIWebsitePatterns.some(pattern => url.includes(pattern))) {
    return false;
  }

  try {
    const currentHostname = new URL(url).hostname;
    return blockedSites.some(site => currentHostname.includes(site));
  } catch (e) {
    // Invalid URL (e.g. chrome://extensions), so don't block.
    return false;
  }
}

// Check if pomodoro mode is active and if so then also check if active tab is blocked
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes?.currentMode?.newValue === 'pomodoro') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const { blockedSites } = await chrome.storage.local.get('blockedSites');
      if (tabs.length > 0 && blockedSites && blockedSites.length > 0) {
        const tab = tabs[0];
        if (isUrlBlocked(tab.url, blockedSites)) {
          chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("blocked.html") });
        }
      }
    });
  }
});

// Fires when the active tab changes (mainly to prevent users from bypassing the block list by switching previously opened tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { currentMode, blockedSites } = await chrome.storage.local.get(['isActive', 'currentMode', 'blockedSites']);
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (currentMode === 'pomodoro' && blockedSites && blockedSites.length > 0) {
    if (isUrlBlocked(tab.url, blockedSites)) {
      chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("blocked.html") });
    }
  }
});

// Fires when a tab is created or updated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url || !changeInfo.url) {
    return;
  }

  const { currentMode, blockedSites } = await chrome.storage.local.get(['isActive', 'currentMode', 'blockedSites']);
  if (currentMode === 'pomodoro' && blockedSites && blockedSites.length > 0) {
    if (isUrlBlocked(tab.url, blockedSites)) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    }
  }
});

async function checkPomoAITab() {
  const tabs = await chrome.tabs.query({ url: pomoAIWebsiteChromePatterns });
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