const pomoAIWebsiteChromePatterns = ["*://localhost/*", "*://pomoai.tech/*"];
const pomoAIWebsitePatterns = ["localhost", "pomoai.tech"];

/**
 * Checks if a given URL is in the list of blocked sites.
 * @param {string} url - The URL to check.
 * @param {string[]} blockedSites - An array of hostnames to block.
 * @returns {boolean} - True if the URL is blocked, false otherwise.
 */
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

/**
 * Listens for changes in chrome storage. If the timer mode changes to 'pomodoro',
 * it checks if the active tab should be blocked.
 * @param {object} changes - The changes in storage.
 * @param {string} area - The storage area ('local', 'sync', etc.).
 */
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

/**
 * Listens for when the active tab changes. If in 'pomodoro' mode, it checks if the newly activated tab should be blocked.
 * This prevents bypassing the block list by switching to already open tabs.
 * @param {object} activeInfo - Information about the newly active tab.
 */
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

/**
 * Listens for when a tab is created or updated. If in 'pomodoro' mode, it checks if the tab's URL should be blocked.
 * @param {number} tabId - The ID of the tab.
 * @param {object} changeInfo - Information about the changes to the tab.
 * @param {chrome.tabs.Tab} tab - The state of the tab that was updated.
 */
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

/**
 * Checks if a PomoAI website tab is open.
 * Updates chrome storage with the presence status and sets the extension icon accordingly.
 * @returns {Promise<boolean>} - A promise that resolves to true if a single PomoAI tab is present.
 */
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

/**
 * Listens for the extension's installation event to check for the PomoAI tab.
 */
// Check for PomoAI tab at all times
chrome.runtime.onInstalled.addListener(() => {
  checkPomoAITab();
});

/**
 * Listens for the browser's startup event to check for the PomoAI tab.
 */
chrome.runtime.onStartup.addListener(() => {
  checkPomoAITab();
});

/**
 * Listens for new tab creation to check for the PomoAI tab.
 * @param {chrome.tabs.Tab} tab - The tab that was created.
 */
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkPomoAITab();
  }
});

/**
 * Listens for tab updates to check for the PomoAI tab.
 * @param {number} tabId - The ID of the tab.
 * @param {object} changeInfo - Information about the changes to the tab.
 * @param {chrome.tabs.Tab} tab - The state of the tab that was updated.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    checkPomoAITab();
  }
});

/**
 * Listens for tab removal to check for the PomoAI tab.
 * @param {number} tabId - The ID of the removed tab.
 * @param {object} removeInfo - Information about the removal.
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  checkPomoAITab();
});