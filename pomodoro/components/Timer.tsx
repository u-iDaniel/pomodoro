"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useSession } from "next-auth/react";
import Slide from "@mui/material/Slide";
import { useTimer } from "@/components/TimerContext";
import Link from "next/link";
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/200.css";

interface UserPreference {
  predictedGenre: string;
  spotifyTrackId: string;
}

export default function Timer() {
  const { data: session } = useSession();
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(
    null
  );
  const [hasBeenAcknowledged, setHasBeenAcknowledged] = useState(true);

  const [pomodoroClicked, setPomodoroClicked] = useState(currentMode === "pomodoro");
  const [shortBreakClicked, setShortBreakClicked] = useState(false);
  const [longBreakClicked, setLongBreakClicked] = useState(false);

  // Helper functions with useCallback to prevent unnecessary re-renders
  const sendNotification = useCallback((message: string) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  }, []);

  const playSound = useCallback(() => {
    const sound = new Audio(
      "/sounds/mixkit-kids-cartoon-close-bells-2256 (1).mp3"
    );
    sound.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  }, []);

  const timeFormat = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      Math.floor(seconds)
    ).padStart(2, "0")}`;
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch user preferences
  useEffect(() => {
    if (session?.user) {
      const fetchPreferences = async () => {
        try {
          const response = await fetch("/api/preferences");
          const data = await response.json();
          if (data.preference) {
            setUserPreference({
              predictedGenre: data.preference.predictedGenre,
              spotifyTrackId: data.preference.spotifyTrackId,
            });
          }
        } catch (error) {
          console.error("Error fetching preferences:", error);
        }
      };
      fetchPreferences();
    }
  }, [session]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    if (timerCompleteHandled.current) return;

    timerCompleteHandled.current = true;

    setIsActive(false);
    setDropdownOpen(true);
    setHasBeenAcknowledged(false);

    if (currentMode === "pomodoro") {
      setPomodoroCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount === 4) {
          sendNotification("you have done 4 pomodoros, take a long break!");
          setTimeout(() => {
            setTimeLeft(longBreakTime * 60);
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
            setTimeLeft(shortBreakTime * 60);
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
        setTimeLeft(pomodoroTime * 60);
        setMode("pomodoro");
        setShortBreakClicked(false);
        setPomodoroClicked(true);
        setLongBreakClicked(false);
      }, 0);
      playSound();
    } else if (currentMode === "longBreak") {
      sendNotification("long break is over! time to start a pomodoro.");
      setTimeout(() => {
        setTimeLeft(pomodoroTime * 60);
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

  // Timer countdown effect (uses web worker to prevent timer slowing down when tab is in background)
  useEffect(() => {
    // Initialize worker on first mount
    if (!workerRef.current) {
      const workerUrl = new URL('../public/timerWorker.js', import.meta.url); // has to be js to be loaded in the browser (typescript will not work)
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
        timeLeft,
      });
    } else if (!isActive && timeLeft > 0) {
      // Post message to worker to pause countdown
      workerRef.current.postMessage({
        action: "PAUSE",
        timeLeft,
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
  });
}, [currentMode, timeFormat, timeLeft]);
  
  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Timer complete check effect - separate from main countdown
  useEffect(() => {
    // Skip first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timeLeft === 0 && !dropdownOpen && hasBeenAcknowledged) {
      timerCompleteHandled.current = false;
      handleTimerComplete();
    }
  }, [timeLeft, dropdownOpen, hasBeenAcknowledged, handleTimerComplete]);

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
    setTimeLeft(pomodoroTime * 60);
    setMode("pomodoro");
    window.postMessage({
      type: "TIMER",
      action: "UPDATE",
      mode: "pomodoro",
      timeLeft: timeFormat(pomodoroTime * 60),
    });
  }, [pomodoroTime, setIsActive, setTimeLeft, setMode, timeFormat]);

  const toggleTimer = useCallback(() => {
    setIsActive((prevActive) => !prevActive);
  }, [setIsActive]);

  const toggleShortBreak = useCallback(() => {
    setShortBreakClicked(true);
    setPomodoroClicked(false);
    setLongBreakClicked(false);
    setIsActive(false);
    setTimeLeft(shortBreakTime * 60);
    setMode("shortBreak");
  }, [setIsActive, setMode, setTimeLeft, shortBreakTime]);

  const toggleLongBreak = useCallback(() => {
    setLongBreakClicked(true);
    setShortBreakClicked(false);
    setPomodoroClicked(false);
    setIsActive(false);
    setTimeLeft(longBreakTime * 60);
    setMode("longBreak");
  }, [longBreakTime, setIsActive, setTimeLeft, setMode]);

  const handleDialogClose = useCallback(() => {
    setDropdownOpen(false);
    setHasBeenAcknowledged(true);
  }, []);

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

        {session ? (
          ""
        ) : (
          <div
            style={{
              fontFamily: "Montserrat, Arial, sans",
              fontWeight: "200",
              color: "white",
              marginTop: "50px",
            }}
          >
            want AI personalized break recommendations?{" "}
            <Link className="underline" href={"/login"}>
              sign up
            </Link>
          </div>
        )}
      </Box>

      {/* Break AI recommendation pop-up */}

      <Slide direction="up" in={dropdownOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            top: "70%",
            right: "5%",
            width: 350,
            bgcolor: "#8421DE",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            break time! 🎉
          </Typography>
          <Typography variant="body1">
            {currentMode === "pomodoro"
              ? "break is over, back to work!"
              : "Time for a short break!"}
          </Typography>

          {session && userPreference?.spotifyTrackId && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Recommended {userPreference.predictedGenre} track for your
                break:
              </Typography>
              <iframe
                src={`https://open.spotify.com/embed/track/${userPreference.spotifyTrackId}`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                loading="lazy"
              />
            </Box>
          )}

          <Button
            onClick={handleDialogClose}
            variant="contained"
            sx={{ mt: 1, backgroundColor: "#673AB7" }}
          >
            OK
          </Button>
        </Box>
      </Slide>
    </>
  );
}
