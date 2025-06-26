const timerEl  = document.getElementById('timer');
const buttonEl = document.getElementById('timer-button');
const modeEl = document.getElementById('mode');
const buttonIconSVGEl = document.getElementById('button-icon');
const buttonTextEl = document.getElementById('button-text');
const inactiveDiv = document.getElementById('inactive');

let isActive = false;

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


chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.currentTimer && changes.currentTimer?.newValue) {
        timerEl.textContent = changes.currentTimer.newValue;
    }
    if (area === 'sync' && changes.currentMode && changes.currentMode?.newValue) {
        modeEl.textContent = convertCamelCaseToSpaced(changes.currentMode.newValue);
    }
});

buttonEl.addEventListener('click', () => {
    isActive = !isActive;
    const action = isActive ? "START" : "PAUSE";
    // port.postMessage({ type: "TIMER", action });
    buttonIconSVGEl.setAttribute('src', isActive ? './pause.svg' : './start.svg');
    buttonTextEl.textContent = isActive ? 'pause' : 'start';
    isActive ? buttonEl.classList.add('button-box-shadow') : buttonEl.classList.remove('button-box-shadow');
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['isPomoAITabPresent', 'currentTimer', 'currentMode'], (result) => {
        if (result.currentTimer) {
            timerEl.textContent = result.currentTimer;
        }

        if (result.currentMode) {
            modeEl.textContent = convertCamelCaseToSpaced(result.currentMode);
        }

        if (result.isPomoAITabPresent) {
            inactiveDiv.style.display = 'none';
        } else {
            inactiveDiv.style.display = 'block';
            timerEl.textContent = 'xx:xx';
            modeEl.textContent = '';
        }
    });
});