"use client"; // Required for client-side state and effects

import { useState, useEffect } from "react";

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export default function Timer() {

    const [isRunning, setIsRunning] = useState(false);

    const toggleTimer = () => {
        setIsRunning((prev) => !prev)
    }
  return (
    <Box sx={{ textAlign: "center", margin: "200px 0"}}>
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 2}}>
        <Grid item>
          <Button
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: "white", color: "black", borderRadius: 8 }}
          >
            pomodoro
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: "white", color: "black", borderRadius: 8 }}
          >
            short break
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: "white", color: "black", borderRadius: 8  }}
          >
            long break
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h1" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
        25:00
      </Typography>

      <Button
            startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon /> }
            variant="contained"
            onClick={toggleTimer}
            sx={{ textTransform: "none", padding:"0.5rem 4rem", fontSize: 28, backgroundColor: "#DE8421" }}
          >
            {isRunning ? "pause" : "start"}
          </Button>

    <Typography variant="p" component="div" sx={{ mt: 8, mb: 2 }}>
            want AI personalized break recommendations? sign up
      </Typography>
    </Box>
  );
}