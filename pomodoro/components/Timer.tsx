"use client";

import { useState, useEffect } from "react";
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

function getPomodoroTime(): number {
  const pomodoroTime = localStorage.getItem("pomodoroTime")
  if(pomodoroTime === null) {
    return 25
  } else {
    return Number(pomodoroTime)
  }
}

function getShortBreakTime() : number {
  const shortBreakTime = localStorage.getItem("shortBreakTime")
  if(shortBreakTime === null) {
    return 5
  } else {
    return Number(shortBreakTime)
  }
}

function getLongBreakTime(): number {
  const longBreakTime = localStorage.getItem("longBreakTime")
  if(longBreakTime === null) {
    return 10
  } else {
    return Number(longBreakTime)
  }
}

export default function Timer() {

  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState(getPomodoroTime() * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeButton, setActiveButton] = useState("pomodoro");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(getPomodoroTime());
  const [shortBreakTime, setShortBreakTime] = useState(getShortBreakTime());
  const [longBreakTime, setLongBreakTime] = useState(getLongBreakTime());
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [hasBeenAcknowledged, setHasBeenAcknowledged] = useState(true);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  
  /*
  useEffect(() => {
    if (dropdownOpen) {
      const timer = setTimeout(() => {
        setDropdownOpen(false); 
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [dropdownOpen]);
  */

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
  }, [session]);
 
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && hasBeenAcknowledged) {
      setIsActive(false);
      setDropdownOpen(true);
      setHasBeenAcknowledged(false);
      if (activeButton === "pomodoro") {
        setPomodoroCount((prevCount) => {
          const newCount = prevCount + 1;
          if (newCount === 4) {
            sendNotification("you have done 4 pomodoros, take a long break!");
            setTimeLeft(longBreakTime * 60);
            setActiveButton("long break");
            playSound();
            return 0;
          } else {
            sendNotification("pomodoro complete! take a short break.");
            setTimeLeft(shortBreakTime * 60);
            setActiveButton("short break");
            playSound();
            return newCount;
          }
        });
      } else if (activeButton === "short break") {
        sendNotification("short break is over! time to start a pomodoro.");
        setTimeLeft(pomodoroTime * 60);
        setActiveButton("pomodoro");
        playSound();
      } else if (activeButton === "long break") {
        sendNotification("long break is over! time to start a pomodoro.");
        setTimeLeft(pomodoroTime * 60);
        setPomodoroCount(0);
        setActiveButton("pomodoro");
        playSound();
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, activeButton, pomodoroTime, shortBreakTime, longBreakTime, hasBeenAcknowledged]);

  const timeFormat = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const pomodoroTimer = () => {
    setIsActive(false);
    setTimeLeft(pomodoroTime * 60);
    setActiveButton("pomodoro");
  };

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const toggleShortBreak = () => {
    setIsActive(false);
    setTimeLeft(shortBreakTime * 60);
    setActiveButton("short break");
  };

  const toggleLongBreak = () => {
    setIsActive(false);
    setTimeLeft(longBreakTime * 60);
    setActiveButton("long break");
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

  const handleSave = (pomodoro: number, shortBreak: number, longBreak: number) => {
    setPomodoroTime(pomodoro);
    setShortBreakTime(shortBreak);
    setLongBreakTime(longBreak);
    
    localStorage.setItem("pomodoroTime", String(pomodoro));
    localStorage.setItem("shortBreakTime", String(shortBreak));
    localStorage.setItem("longBreakTime", String(longBreak));
  
    if (isActive) {
      setIsActive(false);
  
      if (activeButton === "pomodoro") {
        setTimeLeft(pomodoro * 60); 
      } else if (activeButton === "short break") {
        setTimeLeft(shortBreak * 60); 
      } else if (activeButton === "long break") {
        setTimeLeft(longBreak * 60); 
      }
    } else {
      if (activeButton === "pomodoro") {
        setTimeLeft(pomodoro * 60);
      } else if (activeButton === "short break") {
        setTimeLeft(shortBreak * 60);
      } else if (activeButton === "long break") {
        setTimeLeft(longBreak * 60);
      }
    } 
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
              backgroundColor: activeButton === "pomodoro" ? "#21DE84" : "white",
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
              backgroundColor: activeButton === "short break" ? "#21DE84" : "white",
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
              backgroundColor: activeButton === "long break" ? "#21DE84" : "white",
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

  <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} onSave={handleSave} />

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
          {activeButton === "pomodoro" ? "break is over, back to work!" : "Time for a short break!"}
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

