"use client"; // Required for client-side state and effects

import { useState, useEffect } from "react";

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Timer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [activeButton, setActiveButton] = useState("pomodoro"); 
    const [pomodoroCount, setPomodoroCount] = useState(0);  
    const { data: session } = useSession();

    useEffect(() => {
      // Request permission for notifications when the component mounts
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }, []);


    useEffect(() => {
      let interval: NodeJS.Timeout;
    
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setIsActive(false); // Always stop the timer
    
        if (activeButton === "pomodoro") {
          setPomodoroCount((prevCount) =>  {
            const newCount = prevCount + 1;
          if (newCount === 4) {
            sendNotification("you have done 4 pomodoros, take a long break!");
            setTimeLeft(10 * 60); // 10
            setActiveButton("long break");
            playSound();
            return 0
          } else {
            sendNotification("pomodoro complete! take a short break.");
            setTimeLeft(5 * 60); // 5
            setActiveButton("short break"); 
            playSound();
            return newCount
          }
        });


        } else if (activeButton === "short break") {
          sendNotification("short break is over! time to start a pomodoro.");
          setTimeLeft(25 * 60); // 25 
          setActiveButton("pomodoro");
          playSound();
        } else if (activeButton === "long break") {
          sendNotification("long break is over! time to start a pomodoro.");
          setTimeLeft(25 * 60); // 25 
          setPomodoroCount(0); 
          setActiveButton("pomodoro"); 
          playSound();
        }
      }
    
      return () => clearInterval(interval);
    }, [isActive, timeLeft, activeButton]);

    const timeFormat = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const pomodoroTimer = () => {
      setIsActive(false);
      setTimeLeft(25 * 60); // 25
      setActiveButton("pomodoro")
    };

    const toggleTimer = () => {
        setIsActive((prev) => !prev)
    };

    const toggleShortBreak = () => {
      setIsActive(false);
      setTimeLeft(5 * 60); // 5
      setActiveButton("short break")
  };
  
    const toggleLongBreak = () => {
        setIsActive(false);
        setTimeLeft(10 * 60); // 10
        setActiveButton("long break")
    };

    // Function to send notifications
  const sendNotification = (message: string) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  };

  // Function to play a bell sound
  const playSound = () => {
    const sound = new Audio("/sounds/mixkit-kids-cartoon-close-bells-2256 (1).mp3"); 
    sound.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });   
  };
    
  return (
    <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh"}}>
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 2}}>
        <Grid>
          <Button
            variant="contained"
            sx={{ textTransform: "none",  
                  backgroundColor: activeButton === "pomodoro" ? "#21DE84" : "white", 
                  color: "black", 
                  borderRadius: 8 }}
            onClick={pomodoroTimer}
          >
            pomodoro
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            sx={{ textTransform: "none", 
                  backgroundColor: activeButton === "short break" ? "#21DE84" : "white", 
                  color: "black", 
                  borderRadius: 8 }}
            onClick={toggleShortBreak} 
          >
            short break
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            sx={{ textTransform: "none", 
                  backgroundColor: activeButton === "long break" ? "#21DE84" : "white", 
                  color: "black", 
                  borderRadius: 8  }}
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
              startIcon={isActive ? <PauseIcon /> : <PlayArrowIcon /> }
              variant="contained"
              onClick={toggleTimer}
              sx={{ textTransform: "none", padding:"0.5rem 4rem", fontSize: 28, backgroundColor: "#DE8421"}}
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
          )}
    </Box>
  );
}