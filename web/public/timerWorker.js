// This is a Web Worker script for managing the timer in the Pomodoro web application
// It handles starting and pausing the timer based on messages received from the main thread.
let timerId = null;
let isRunning = false;

self.onmessage = (e) => {
  const { action, timeLeft } = e.data;

  switch (action) {
    case "START":
      if (!isRunning) {
        isRunning = true;
        let currentTime = timeLeft;
        timerId = setInterval(() => {
            if (currentTime > 0) {
                currentTime--;
                self.postMessage({ timeLeft: currentTime });
            } else {
                clearInterval(timerId);
                isRunning = false;
            }
        }, 1000);
      }
      break;
    case "PAUSE":
      // Pause the timer
      if (timerId && isRunning) {
        clearInterval(timerId);
        isRunning = false;
      }
      break;
    default:
      break;
  }
};
