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
          color: "black",
          padding: "0px",
          fontFamily: "Montserrat, Arial, sans-serif",
          fontWeight: "bold",
          fontSize: "1.25rem",
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

        <p
          style={{ paddingTop: "0px", fontSize: "1.25rem", fontWeight: "bold" }}
        >
          <AccessTimeIcon /> time (minutes)
        </p>
        <List sx={{ display: "flex" }}>
          <ListItem sx={{ display: "block" }}>
            <TextField
              type="text"
              label="pomodoro"
              variant="outlined"
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
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                fontFamily: "Montserrat, Arial, sans",
                input: { color: "#000000" },
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat, Arial, sans",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "16px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                },
              }}
            />
          </ListItem>

          <ListItem sx={{ display: "block" }}>
            <TextField
              type="text"
              label="short break"
              variant="outlined"
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
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                fontFamily: "Montserrat, Arial, sans",
                input: { color: "#000000" },
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat, Arial, sans",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "16px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                },
              }}
            />
          </ListItem>
          <ListItem sx={{ display: "block" }}>
            <TextField
              type="text"
              label="long break"
              variant="outlined"
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
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                fontFamily: "Montserrat, Arial, sans",
                input: { color: "#000000" },
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat, Arial, sans",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "16px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                },
              }}
            />
          </ListItem>
        </List>

        <DialogActions>
          <button
            onClick={handleSave}
            className="p-2 border-2 border-black rounded-2xl transition duration-200 hover:shadow-lg hover:scale-105 font-bold"
          >
            save
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
