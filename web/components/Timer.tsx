"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useTimer } from "@/components/TimerContext";
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/200.css";

export default function Timer() {
  const {
    timeLeft,
    setTimeLeft,
    isActive,
    setIsActive,
    currentMode,
    setMode,
    pomodoroTime,
    shortBreakTime,
    longBreakTime,
  } = useTimer();

  // Use refs to track state safely
  const isInitialMount = useRef(true);
  const timerCompleteHandled = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const [pomodoroClicked, setPomodoroClicked] = useState(
    currentMode === "pomodoro"
  );
  const [shortBreakClicked, setShortBreakClicked] = useState(false);
  const [longBreakClicked, setLongBreakClicked] = useState(false);

  // Helper functions with useCallback to prevent unnecessary re-renders
  const sendNotification = useCallback((message: string) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  }, []);

  const playSound = useCallback(() => {
    const notificationEnabled = localStorage.getItem("notification");
    if (notificationEnabled === "true") {
      const sound = new Audio(
        "/sounds/mixkit-kids-cartoon-close-bells-2256 (1).mp3"
      );
      sound.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  }, []);

  const timeFormat = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      Math.floor(seconds)
    ).padStart(2, "0")}`;
  }, []);

  // Request notification permission on mount (check if notification in window for iPhone compatibility)
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Timer countdown effect (uses web worker to prevent timer slowing down when tab is in background)
  useEffect(() => {
    // Initialize worker on first mount
    if (!workerRef.current) {
      const workerUrl = new URL("../public/timerWorker.js", import.meta.url); // has to be js to be loaded in the browser (typescript will not work)
      workerRef.current = new Worker(workerUrl);
      // Receives messages from the worker and sets timeLeft
      workerRef.current.onmessage = (e) => {
        const { timeLeft: newTimeLeft } = e.data;
        setTimeLeft(newTimeLeft as number);
      };
    }

    if (isActive && timeLeft > 0) {
      // Post message to worker to start countdown
      workerRef.current.postMessage({
        action: "START",
        timeLeft: Math.round(timeLeft),
      });
    } else if (!isActive && timeLeft > 0) {
      // Post message to worker to pause countdown
      workerRef.current.postMessage({
        action: "PAUSE",
        timeLeft: Math.round(timeLeft),
      });
    }
  }, [isActive, setTimeLeft, timeLeft]);

  // Send over timer state to chrome extension
  useEffect(() => {
    window.postMessage({
      type: "TIMER",
      action: "UPDATE",
      mode: currentMode,
      timeLeft: timeFormat(timeLeft),
      isActive: isActive,
    });
  }, [currentMode, isActive, timeFormat, timeLeft]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    if (timerCompleteHandled.current) return;

    timerCompleteHandled.current = true;

    setIsActive(false);

    if (currentMode === "pomodoro") {
      setPomodoroCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount === 4) {
          sendNotification("you have done 4 pomodoros, take a long break!");
          setTimeout(() => {
            setTimeLeft(Math.round(Number(longBreakTime) * 60));
            setMode("longBreak");
            setShortBreakClicked(false);
            setPomodoroClicked(false);
            setLongBreakClicked(true);
          }, 0);
          playSound();
          return 0;
        } else {
          sendNotification("pomodoro complete! take a short break.");
          setTimeout(() => {
            setTimeLeft(Math.round(Number(shortBreakTime) * 60));
            setMode("shortBreak");
            setShortBreakClicked(true);
            setPomodoroClicked(false);
            setLongBreakClicked(false);
          }, 0);
          playSound();
          return newCount;
        }
      });
    } else if (currentMode === "shortBreak") {
      sendNotification("short break is over! time to start a pomodoro.");
      setTimeout(() => {
        setTimeLeft(Math.round(Number(pomodoroTime) * 60));
        setMode("pomodoro");
        setShortBreakClicked(false);
        setPomodoroClicked(true);
        setLongBreakClicked(false);
      }, 0);
      playSound();
    } else if (currentMode === "longBreak") {
      sendNotification("long break is over! time to start a pomodoro.");
      setTimeout(() => {
        setTimeLeft(Math.round(Number(pomodoroTime) * 60));
        setPomodoroCount(0);
        setMode("pomodoro");
        setShortBreakClicked(false);
        setPomodoroClicked(true);
        setLongBreakClicked(false);
      }, 0);
      playSound();
    }
  }, [
    currentMode,
    longBreakTime,
    shortBreakTime,
    pomodoroTime,
    setTimeLeft,
    setMode,
    setPomodoroCount,
    setIsActive,
    sendNotification,
    playSound,
  ]);

  // Timer complete check effect - separate from main countdown
  useEffect(() => {
    // Skip first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timeLeft === 0) {
      handleTimerComplete();
    }
  }, [timeLeft, handleTimerComplete]);

  // Reset the timer complete flag when timeLeft changes from 0 to something else
  useEffect(() => {
    if (timeLeft > 0) {
      timerCompleteHandled.current = false;
    }
  }, [timeLeft]);

  // Event handler functions
  const pomodoroTimer = useCallback(() => {
    setPomodoroClicked(true);
    setShortBreakClicked(false);
    setLongBreakClicked(false);
    setIsActive(false);
    setTimeLeft(Math.round(Number(pomodoroTime) * 60));
    setMode("pomodoro");
  }, [pomodoroTime, setIsActive, setTimeLeft, setMode]);

  const toggleTimer = useCallback(() => {
    setIsActive((prevActive) => !prevActive);
  }, [setIsActive]);

  const toggleShortBreak = useCallback(() => {
    setShortBreakClicked(true);
    setPomodoroClicked(false);
    setLongBreakClicked(false);
    setIsActive(false);
    setTimeLeft(Math.round(Number(shortBreakTime) * 60));
    setMode("shortBreak");
  }, [setIsActive, setMode, setTimeLeft, shortBreakTime]);

  const toggleLongBreak = useCallback(() => {
    setLongBreakClicked(true);
    setShortBreakClicked(false);
    setPomodoroClicked(false);
    setIsActive(false);
    setTimeLeft(Math.round(Number(longBreakTime) * 60));
    setMode("longBreak");
  }, [longBreakTime, setIsActive, setTimeLeft, setMode]);

  return (
    <>
      <Box
        sx={{
          textAlign: "center",
        }}
      >
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Grid>
            <button
              onClick={pomodoroTimer}
              style={{
                borderRadius: "20px",
                backgroundColor: "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: pomodoroClicked ? "#00FF37" : "white",
                padding: "10px 20px",
                color: pomodoroClicked ? "#00FF37" : "white",
                transition: "border-color 0.4s ease, color 0.4s ease",
                fontFamily: "Montserrat, Arial, sans",
                fontWeight: "200",
              }}
            >
              pomodoro
            </button>
          </Grid>
          <Grid>
            <button
              onClick={toggleShortBreak}
              style={{
                borderRadius: "20px",
                backgroundColor: "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: shortBreakClicked ? "#00FF37" : "white",
                padding: "10px 20px",
                color: shortBreakClicked ? "#00FF37" : "white",
                transition: "border-color 0.4s ease, color 0.4s ease",
                fontFamily: "Montserrat, Arial, sans",
                fontWeight: "200",
              }}
            >
              short break
            </button>
          </Grid>
          <Grid>
            <button
              onClick={toggleLongBreak}
              style={{
                borderRadius: "20px",
                backgroundColor: "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: longBreakClicked ? "#00FF37" : "white",
                padding: "10px 20px",
                color: longBreakClicked ? "#00FF37" : "white",
                transition: "border-color 0.4s ease, color 0.4s ease",
                fontFamily: "Montserrat, Arial, sans",
                fontWeight: "200",
              }}
            >
              long break
            </button>
          </Grid>
        </Grid>

        <div
          id="page-timer"
          style={{
            fontFamily: "Montserrat, Arial, sans",
            fontWeight: "300",
            fontSize: "6rem",
            color: "white",
          }}
        >
          {timeFormat(timeLeft)}
        </div>

        <button
          id="pomoai-timer-button"
          onClick={toggleTimer}
          style={{
            width: "250px",
            fontSize: "28px",
            fontFamily: "Montserrat, Arial, sans",
            fontWeight: "300",
            color: "white",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "white",
            boxShadow: isActive ? "0 0 10px rgb(236, 247, 236)" : "none",
            transition: "box-shadow 0.4s ease",
            padding: "10px 40px",
            borderRadius: "50px",
          }}
        >
          {isActive ? <PauseIcon /> : <PlayArrowIcon />}
          {isActive ? "pause" : "start"}
        </button>
      </Box>
    </>
  );
}
