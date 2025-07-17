"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  Box,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSession } from "next-auth/react";
import React from "react";

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
  order: number;
}

const AddTask: FC<DialogComponentProps> = ({
  open,
  onClose,
  setTasks,
  tasks,
}) => {
  const [newTask, setNewTask] = useState("");
  const [numPomodoros, setNumPomodoros] = useState("1");
  const { data: session } = useSession();

  const saveTask = async (task: Task) => {
    if (!session?.user) return;
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, userid: session.user.id }),
      });
    } catch {
      alert("Error saving task");
    }
  };

  const saveAdd = () => {
    if (newTask.trim() === "") return;
    const new_id = Date.now();

    const task = {
      id: new_id,
      text: newTask.trim(),
      completed: false,
      numPomodoro: Number(numPomodoros),
      order: Number(tasks.length + 1),
    };
    setTasks((prev) => [...prev, task]);
    saveTask(task);
    setNewTask("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{ backgroundColor: "white", color: "black" }}>
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
        add task
      </DialogTitle>
      <Divider sx={{ backgroundColor: "rgba(0,0,0,0.1)" }} />
      <DialogContent
        sx={{ backgroundColor: "white", color: "black", width: "32rem" }}
      >
        <Box>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
              marginBottom: "1rem",
            }}
          >
            <TextField
              type="text"
              variant="outlined"
              label="task"
              value={newTask}
              autoComplete="off"
              onChange={(e) => setNewTask(e.target.value)}
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                width: "400px",
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
              size="small"
            />
            <TextField
              type="text"
              variant="outlined"
              label="pomodoros"
              value={numPomodoros}
              autoComplete="off"
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) setNumPomodoros(val);
              }}
              onBlur={() => {
                if (numPomodoros === "" || isNaN(Number(numPomodoros))) {
                  setNumPomodoros("1");
                }
              }}
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                width: "150px",
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
              size="small"
            />
          </div>
        </Box>

        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={saveAdd}
            variant="outlined"
            sx={{
              px: 2,
              py: 1,
              borderWidth: "2px",
              borderColor: "black",
              color: "black",
              fontWeight: "bold",
              backgroundColor: "white",
              borderRadius: "1rem", // matches rounded-2xl
              textTransform: "none",
              width: 120,
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "white",
                borderColor: "black",
                transform: "scale(1.05)",
              },
            }}
          >
            add task
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddTask;
