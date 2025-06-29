"use client";

import { FC, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import "@fontsource/montserrat/200.css";
import { useSession } from "next-auth/react";

import TextField from "@mui/material/TextField";

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  taskID: number;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

const Edit: FC<DialogComponentProps> = ({
  open,
  onClose,
  taskID,
  setTasks,
  tasks,
}) => {
  const { data: session } = useSession();
  const [newEditTask, setNewEditTask] = useState("");
  const [editNumPomodoros, setEditNumPomodoros] = useState("1");

  const saveEdit = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskID
          ? {
              ...task,
              text: newEditTask.trim(),
              completed: false,
              numPomodoro: Number(editNumPomodoros),
            }
          : task
      )
    );
    saveEditData({
      id: taskID,
      text: newEditTask.trim(),
      completed: false,
      numPomodoro: Number(editNumPomodoros),
    });

    onClose();
  };

  const saveEditData = async (task: Task) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: task.id,
            userid: session.user.id,
            text: task.text,
            completed: task.completed,
            numPomodoro: task.numPomodoro,
          }),
        });

        if (!res.ok) {
          alert("Error editing task");
        }
      } catch (error) {
        console.error("Error editing task:", error);
        alert("Error editing task");
      }
    }
  };

  useEffect(() => {
    if (open) {
      const task = tasks.find((t) => t.id === taskID);
      if (task) {
        setNewEditTask(task.text);
        setEditNumPomodoros(String(task.numPomodoro));
      }
    }
  }, [open, taskID, tasks]);

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
        edit task
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{ backgroundColor: "white", color: "#000000", width: "32rem" }}
      >
        <Box>
          <div className="flex justify-center items-center gap-5">
            <span>task:</span>
            <TextField
              type="text"
              variant="filled"
              value={newEditTask}
              autoComplete="off"
              onChange={(e) => {
                setNewEditTask(e.target.value);
              }}
              sx={{
                width: "400px",
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
            <span>pomodoros:</span>
            <TextField
              type="text"
              variant="filled"
              value={editNumPomodoros}
              autoComplete="off"
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setEditNumPomodoros(val);
                }
              }}
              onBlur={() => {
                if (
                  editNumPomodoros === "" ||
                  isNaN(Number(editNumPomodoros))
                ) {
                  setEditNumPomodoros("1");
                } else {
                  setEditNumPomodoros(editNumPomodoros);
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
          </div>
        </Box>

        <DialogActions>
          <button
            onClick={saveEdit}
            className="p-2 border-2 border-black rounded-2xl transition duration-200 hover:shadow-lg hover:scale-105"
          >
            save
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default Edit;
