"use client";

import { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Box from "@mui/material/Box";
import "@fontsource/montserrat/200.css";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import TextField from "@mui/material/TextField";
import { useTimer } from "./TimerContext";

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
}

const Settings: FC<DialogComponentProps> = ({ open, onClose }) => {
  const {
    setPomodoroTime,
    setShortBreakTime,
    setLongBreakTime,
    currentMode,
    setTimeLeft,
    setIsActive,
  } = useTimer();

  const [pomodoro, setPomodoro] = useState(() => {
    const stored = localStorage.getItem("pomodoroTime");
    return stored ? stored : "25"; // Default 25 minutes
  });

  const [shortBreak, setShortBreak] = useState(() => {
    const stored = localStorage.getItem("shortBreakTime");
    return stored ? stored : "5"; // Default 5 minutes
  });

  const [longBreak, setLongBreak] = useState(() => {
    const stored = localStorage.getItem("longBreakTime");
    return stored ? stored : "15"; // Default 15 minutes
  });

  const handleSave = () => {
    // Store values in minutes in localStorage
    localStorage.setItem("pomodoroTime", String(pomodoro));
    localStorage.setItem("shortBreakTime", String(shortBreak));
    localStorage.setItem("longBreakTime", String(longBreak));

    // For actual timer
    setPomodoroTime(pomodoro);
    setShortBreakTime(shortBreak);
    setLongBreakTime(longBreak);

    // Convert to seconds for the timer
    if (currentMode === "pomodoro") {
      setTimeLeft(Math.round(Number(pomodoro) * 60));
    } else if (currentMode === "shortBreak") {
      setTimeLeft(Math.round(Number(shortBreak) * 60));
    } else {
      setTimeLeft(Math.round(Number(longBreak) * 60));
    }

    setIsActive(false); // Stop the timer when settings are saved
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{ backgroundColor: "white", color: "#000000" }}>
        <Button onClick={onClose}>
          <CloseIcon sx={{ color: "black" }} />
        </Button>
      </DialogActions>

      <DialogTitle
        sx={{
          textAlign: "center",
          backgroundColor: "white",
          color: "#000000",
          padding: "0px",
        }}
      >
        settings
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{ backgroundColor: "white", color: "#000000", width: "32rem" }}
      >
        {/* You can add more settings options here */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            ml: "auto",
            color: "#8C8C8C",
          }}
        ></Box>

        <p style={{ paddingTop: "0px", fontSize: "1.25rem" }}>
          <AccessTimeIcon /> time (minutes)
        </p>
        <List sx={{ display: "flex" }}>
          <ListItem sx={{ display: "block", padding: "0" }}>
            <ListItemText primary="pomodoro" />
            <TextField
              type="text"
              variant="filled"
              value={pomodoro}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;

                if (/^\d*\.?\d*$/.test(val)) {
                  setPomodoro(val);
                }
              }}
              onBlur={() => {
                // Normalize the number on blur (e.g., turn "1." into "1")
                if (pomodoro === "" || isNaN(Number(pomodoro))) {
                  setPomodoro("25");
                } else {
                  setPomodoro(pomodoro);
                }
              }}
              sx={{
                width: "100px",
                "& .MuiFilledInput-root": {
                  backgroundColor: "#E5E5E5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "&:after": {
                    borderBottom: "2px solid #2697A3",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  padding: "14px 14px",
                },
              }}
            />
          </ListItem>

          <ListItem sx={{ display: "block", padding: "0" }}>
            <ListItemText primary="short break" />
            <TextField
              type="text"
              variant="filled"
              value={shortBreak}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;

                if (/^\d*\.?\d*$/.test(val)) {
                  setShortBreak(val);
                }
              }}
              onBlur={() => {
                if (shortBreak === "" || isNaN(Number(shortBreak))) {
                  setShortBreak("5");
                } else {
                  setShortBreak(shortBreak);
                }
              }}
              sx={{
                width: "100px",
                "& .MuiFilledInput-root": {
                  backgroundColor: "#E5E5E5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "&:after": {
                    borderBottom: "2px solid #2697A3",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  padding: "14px 14px",
                },
              }}
            />
          </ListItem>
          <ListItem sx={{ display: "block", padding: "0" }}>
            <ListItemText primary="long break" />
            <TextField
              type="text"
              variant="filled"
              value={longBreak}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;

                if (/^\d*\.?\d*$/.test(val)) {
                  setLongBreak(val);
                }
              }}
              onBlur={() => {
                if (longBreak === "" || isNaN(Number(longBreak))) {
                  setLongBreak("15");
                } else {
                  setLongBreak(longBreak);
                }
              }}
              sx={{
                width: "100px",
                "& .MuiFilledInput-root": {
                  backgroundColor: "#E5E5E5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "&:after": {
                    borderBottom: "2px solid #2697A3",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  padding: "14px 14px",
                },
              }}
            />
          </ListItem>
        </List>

        <DialogActions>
          <button
            onClick={handleSave}
            className="p-2 border border-black rounded-2xl"
          >
            save
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
