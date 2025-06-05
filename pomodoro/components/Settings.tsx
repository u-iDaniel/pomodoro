"use client";

import { FC, useState, useEffect } from "react";
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

  // Use seconds for the timers
  const [pomodoro, setPomodoro] = useState(() => {
    const stored = localStorage.getItem("pomodoroTime");
    return stored ? String(Number(stored)) : "25"; // Default 25 minutes
  });

  const [shortBreak, setShortBreak] = useState(() => {
    const stored = localStorage.getItem("shortBreakTime");
    return stored ? String(Number(stored)) : "5"; // Default 5 minutes
  });

  const [longBreak, setLongBreak] = useState(() => {
    const stored = localStorage.getItem("longBreakTime");
    return stored ? String(Number(stored)) : "15"; // Default 15 minutes
  });

  const handleSave = () => {
    let pomodoroNum = Number(pomodoro);
    let shortBreakNum = Number(shortBreak);
    let longBreakNum = Number(longBreak);

    // Store values in minutes in localStorage
    localStorage.setItem("pomodoroTime", String(pomodoroNum));
    localStorage.setItem("shortBreakTime", String(shortBreakNum));
    localStorage.setItem("longBreakTime", String(longBreakNum));

    setPomodoroTime(pomodoroNum);
    setShortBreakTime(shortBreakNum);
    setLongBreakTime(longBreakNum);

    setPomodoro(String(pomodoroNum));
    setShortBreak(String(shortBreakNum));
    setLongBreak(String(longBreakNum));

    if (currentMode === "pomodoro") {
      setTimeLeft(pomodoroNum * 60);
    } else if (currentMode === "shortBreak") {
      setTimeLeft(shortBreakNum * 60);
    } else {
      setTimeLeft(longBreakNum * 60);
    }

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
              type="number"
              variant="filled"
              value={pomodoro}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                if (e.target.value === "") {
                  setPomodoro("");
                } else {
                  let value = Number(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setPomodoro(String(value));
                  }
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
              type="number"
              variant="filled"
              value={shortBreak}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                if (e.target.value === "") {
                  setShortBreak("");
                } else {
                  let value = Number(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setShortBreak(String(value));
                  }
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
              type="number"
              variant="filled"
              value={longBreak}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                if (e.target.value === "") {
                  setLongBreak("");
                } else {
                  let value = Number(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setLongBreak(String(value));
                  }
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
