"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Dialog from "./Dialog"; 
import { useSession } from "next-auth/react";
import Slide from "@mui/material/Slide"
import { useTimer } from "@/components/TimerContext"; 
import Link from 'next/link';

interface TimerProps {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

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
    setPomodoroTime,
    setShortBreakTime,
    setLongBreakTime
  } = useTimer();

  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [hasBeenAcknowledged, setHasBeenAcknowledged] = useState(true);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      const fetchPreferences = async () => {
        try {
          const response = await fetch('/api/preferences');
          const data = await response.json();
          if (data.preference) {
            setUserPreference({
              predictedGenre: data.preference.predictedGenre,
              spotifyTrackId: data.preference.spotifyTrackId,
            });
          }
        } catch (error) {
          console.error('Error fetching preferences:', error);
        }
      };
      fetchPreferences();
    }
  }, [session, setUserPreference]);

  // Move timer completion logic to a separate function
  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    setDropdownOpen(true);
    setHasBeenAcknowledged(false);

    if (currentMode === "pomodoro") {
      setPomodoroCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount === 4) {
          sendNotification("you have done 4 pomodoros, take a long break!");
          setTimeLeft(longBreakTime);
          setMode("longBreak");
          playSound();
          return 0;
        } else {
          sendNotification("pomodoro complete! take a short break.");
          setTimeLeft(shortBreakTime);
          setMode("shortBreak");
          playSound();
          return newCount;
        }
      });
    } else if (currentMode === "shortBreak") {
      sendNotification("short break is over! time to start a pomodoro.");
      setTimeLeft(pomodoroTime);
      setMode("pomodoro");
      playSound();
    } else if (currentMode === "longBreak") {
      sendNotification("long break is over! time to start a pomodoro.");
      setTimeLeft(pomodoroTime);
      setPomodoroCount(0);
      setMode("pomodoro");
      playSound();
    }
  }, [currentMode, longBreakTime, shortBreakTime, pomodoroTime, setTimeLeft, setMode, setPomodoroCount, setIsActive, setDropdownOpen, setHasBeenAcknowledged]);

  // Add a new effect to handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && !dropdownOpen && hasBeenAcknowledged) {
      handleTimerComplete();
    }
  }, [timeLeft, dropdownOpen, hasBeenAcknowledged, handleTimerComplete]);

  // Update the timer effect to only handle countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, setTimeLeft]);

  const timeFormat = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const pomodoroTimer = () => {
    setIsActive(false);
    setTimeLeft(pomodoroTime);
    setMode("pomodoro");
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const toggleShortBreak = () => {
    setIsActive(false);
    setTimeLeft(shortBreakTime);
    setMode("shortBreak");
  };

  const toggleLongBreak = () => {
    setIsActive(false);
    setTimeLeft(longBreakTime);
    setMode("longBreak");
  };

  const sendNotification = (message: string) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  };

  const playSound = () => {
    const sound = new Audio("/sounds/mixkit-kids-cartoon-close-bells-2256 (1).mp3");
    sound.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  };

  const handleDialogClose = () => {
    setDropdownOpen(false);
    setHasBeenAcknowledged(true);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Grid>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: currentMode === "pomodoro" ? "#21DE84" : "white",
              color: "black",
              borderRadius: 8,
            }}
            onClick={pomodoroTimer}
          >
            pomodoro
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: currentMode === "shortBreak" ? "#21DE84" : "white",
              color: "black",
              borderRadius: 8,
            }}
            onClick={toggleShortBreak}
          >
            short break
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: currentMode === "longBreak" ? "#21DE84" : "white",
              color: "black",
              borderRadius: 8,
            }}
            onClick={toggleLongBreak}
          >
            long break
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h1" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
        {timeFormat(timeLeft)}
      </Typography>

      <Button
        startIcon={isActive ? <PauseIcon /> : <PlayArrowIcon />}
        variant="contained"
        onClick={toggleTimer}
        sx={{ textTransform: "none", padding: "0.5rem 4rem", fontSize: 28, backgroundColor: "#DE8421" }}
      >
        {isActive ? "pause" : "start"}
      </Button>
    {session ? 
      (
        ""
      )
      : 
      (
        <Typography variant="body1" component="div" sx={{ mt: 8, mb: 2 }}>
          want AI personalized break recommendations? <Link className="underline" href={"/login"}>sign up</Link>
        </Typography>
      )
    }
  </Box>

  {/* Break AI reccommendation pop-up */}
  <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

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
        <Typography variant="h6" fontWeight="bold">break time! 🎉</Typography>
        <Typography variant="body1">
          {currentMode === "pomodoro" ? "break is over, back to work!" : "Time for a short break!"}
        </Typography>
        
        {session && userPreference?.spotifyTrackId && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Recommended {userPreference.predictedGenre} track for your break:
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
  </Box>
  );
}

