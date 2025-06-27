const pomoAIWebsitePatterns = ["*://localhost/*", "https://pomoai.tech/*"];
const timerEl  = document.getElementById('timer');
const buttonEl = document.getElementById('timer-button');
const modeEl = document.getElementById('mode');
const buttonIconSVGEl = document.getElementById('button-icon');
const buttonTextEl = document.getElementById('button-text');
const inactiveDiv = document.getElementById('inactive');
const inactiveTextEl = document.getElementById('inactive-text');

// let isActive = false;

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

function updateButtonState(active) {
    buttonIconSVGEl.setAttribute('src', active ? './pause.svg' : './start.svg');
    buttonTextEl.textContent = active ? 'pause' : 'start';
    active ? buttonEl.classList.add('button-box-shadow') : buttonEl.classList.remove('button-box-shadow');
}

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
});

buttonEl.addEventListener('click', () => {
    chrome.tabs.query({ url: pomoAIWebsitePatterns }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "TOGGLE_TIMER"
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['isPomoAITabPresent', 'isTooManyPomoAITabs', 'currentTimer', 'currentMode', 'isActive'], (result) => {
        if (result.currentTimer) {
            timerEl.textContent = result.currentTimer;
        }

        if (result.currentMode) {
            modeEl.textContent = convertCamelCaseToSpaced(result.currentMode);
        }

        if (result.isActive !== undefined) {
            updateButtonState(result.isActive);
        }

        if (result.isPomoAITabPresent) {
            inactiveDiv.style.display = 'none';
        } else {
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