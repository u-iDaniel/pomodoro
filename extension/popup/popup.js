document.addEventListener('DOMContentLoaded', () => {
    const inactiveDiv = document.getElementById('inactive');

    chrome.storage.sync.get(['isPomoAITabPresent'], (result) => {
        if (result.isPomoAITabPresent) {
            inactiveDiv.style.display = 'none';
        } else {
            inactiveDiv.style.display = 'block';
        }
    });
});