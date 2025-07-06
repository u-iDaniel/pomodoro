const pomoAIWebsitePatterns = ["*://localhost/*", "https://pomoai.tech/*"];
const timerEl  = document.getElementById('timer');
const buttonEl = document.getElementById('timer-button');
const modeEl = document.getElementById('mode');
const buttonIconSVGEl = document.getElementById('button-icon');
const buttonTextEl = document.getElementById('button-text');
const inactiveDiv = document.getElementById('inactive');
const inactiveTextEl = document.getElementById('inactive-text');

/**
 * Converts a camelCase string to a spaced lowercase string.
 * @param {string} text - The camelCase text to convert.
 * @returns {string} The converted text.
 */
// Converts camelCase to spaced lowercase (e.g. "shortBreak" -> "short break")
function convertCamelCaseToSpaced(text) {
    let textArr = text.split("");
    for (let i = 0; i < textArr.length; i++) {
        if (textArr[i] === textArr[i].toUpperCase()) {
            textArr[i] = ` ${textArr[i].toLowerCase()}`;
        }
    }
    return textArr.join("");
}

/**
 * Updates the state of the start/pause button in the popup.
 * @param {boolean} active - Whether the timer is active.
 */
function updateButtonState(active) {
    buttonIconSVGEl.setAttribute('src', active ? './pause.svg' : './start.svg');
    buttonTextEl.textContent = active ? 'pause' : 'start';
    active ? buttonEl.classList.add('button-box-shadow') : buttonEl.classList.remove('button-box-shadow');
}

/**
 * Listens for changes in chrome storage and updates the popup UI accordingly.
 * @param {object} changes - The object containing the changed storage items.
 * @param {string} area - The name of the storage area ('local', 'sync', etc.).
 */
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.currentTimer && changes.currentTimer?.newValue) {
        timerEl.textContent = changes.currentTimer.newValue;
    }
    if (area === 'local' && changes.currentMode && changes.currentMode?.newValue) {
        modeEl.textContent = convertCamelCaseToSpaced(changes.currentMode.newValue);
    }
    if (area === 'local' && changes.isActive && changes.isActive?.newValue !== undefined) {
        updateButtonState(changes.isActive.newValue);
    }
    if (area === 'local' && changes.isTimerPresent && changes.isTimerPresent?.newValue !== undefined) {
        if (!changes.isTimerPresent.newValue) {
            buttonEl.disabled = true;
            buttonEl.classList.add('button-disabled');
            inactiveDiv.style.display = 'block';
            inactiveTextEl.textContent = 'to start/pause the timer please go to the timer screen on the pomoAI website';
        } else {
            buttonEl.disabled = false;
            buttonEl.classList.remove('button-disabled');
            inactiveDiv.style.display = 'none';
        }
    }
});

/**
 * Handles the click event for the timer button, sending a message to the content script to toggle the timer.
 */
buttonEl.addEventListener('click', () => {
    chrome.tabs.query({ url: pomoAIWebsitePatterns }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "TOGGLE_TIMER"
            });
        }
    });
});

/**
 * Initializes the popup's state when the DOM is fully loaded by retrieving data from chrome storage.
 */
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['isPomoAITabPresent', 'isTooManyPomoAITabs', 'currentTimer', 'currentMode', 'isActive', 'isTimerPresent'], (result) => {
        if (result.currentTimer) {
            timerEl.textContent = result.currentTimer;
        }

        if (result.currentMode) {
            modeEl.textContent = convertCamelCaseToSpaced(result.currentMode);
        }

        if (result.isActive !== undefined) {
            updateButtonState(result.isActive);
        }

        if (!result.isTimerPresent) {
            buttonEl.disabled = true;
            buttonEl.classList.add('button-disabled');
            inactiveDiv.style.display = 'block';
            inactiveTextEl.textContent = 'to start/pause the timer please go to the timer screen on the pomoAI website';
        }

        if (result.isPomoAITabPresent && result.isTimerPresent) {
            inactiveDiv.style.display = 'none';
            buttonEl.disabled = false;
            buttonEl.classList.remove('button-disabled');
        } else if (!result.isPomoAITabPresent) {
            inactiveDiv.style.display = 'block';
            timerEl.textContent = 'xx:xx';
            modeEl.textContent = '';
            buttonEl.disabled = true;
            updateButtonState(false);
            buttonEl.classList.add('button-disabled');
            if (result.isTooManyPomoAITabs) {
                inactiveTextEl.textContent = 'the extension works best with only one tab open, please close the others';
            }
        }
    });
});