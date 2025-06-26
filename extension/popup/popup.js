const timerEl  = document.getElementById('timer');
const buttonEl = document.getElementById('timer-button');
const buttonIconSVGEl = document.getElementById('button-icon');
const buttonTextEl = document.getElementById('button-text');
const inactiveDiv = document.getElementById('inactive');

let isActive = false;

const port = chrome.runtime.connect({ name: "POMO_AI_POPUP" });

// port.onMessage.addListener((msg) => {
//     if (msg.type === "TIMER" && msg.action === "UPDATE") {
//         timerEl.textContent = msg.timeLeft;
//         console.log(`Popup: Timer updated: ${msg.timeLeft}`);
//     }
// });

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.currentTimer && changes.currentTimer?.newValue) {
        timerEl.textContent = changes.currentTimer.newValue;
    }
});

buttonEl.addEventListener('click', () => {
    isActive = !isActive;
    const action = isActive ? "START" : "PAUSE";
    port.postMessage({ type: "TIMER", action });
    buttonIconSVGEl.setAttribute('src', isActive ? './pause.svg' : './start.svg');
    buttonTextEl.textContent = isActive ? 'pause' : 'start';
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['isPomoAITabPresent'], (result) => {
        if (result.isPomoAITabPresent) {
            inactiveDiv.style.display = 'none';
        } else {
            inactiveDiv.style.display = 'block';
        }
    });
});